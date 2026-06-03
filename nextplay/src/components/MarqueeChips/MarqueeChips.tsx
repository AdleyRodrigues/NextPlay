import React, { useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

interface MarqueeChipsProps {
    children: React.ReactNode[];
    /**
     * Auto-scroll speed in pixels per second.
     * Default: 40px/s
     */
    speed?: number;
    /** Gap between chips in px. Default: 10 */
    gap?: number;
}

/**
 * Auto-scrolls horizontally on mobile (infinite loop with seamless reset).
 *
 * Key insight for the seamless loop:
 *   - We render two identical copies of chips inside a scrollable flex container.
 *   - scrollWidth ≈ 2 * firstCopyWidth + gap (one flex-gap between copies).
 *   - maxScrollLeft = scrollWidth - clientWidth.
 *   - The reset only works when firstCopyWidth >= clientWidth, because only
 *     then maxScrollLeft >= firstCopyWidth (the reset target).
 *   - If chips fit on screen, we skip scrolling entirely.
 *
 * Touch/mouse interaction pauses the animation and allows free drag in any direction.
 * Animation resumes automatically 3 s after the last interaction.
 */
export const MarqueeChips: React.FC<MarqueeChipsProps> = ({
    children,
    speed = 40,
    gap = 10,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const containerRef = useRef<HTMLDivElement>(null);
    const firstCopyRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number | null>(null);
    const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTimeRef = useRef<number | null>(null); // null = "not started yet"
    const isPausedRef = useRef(false);

    const stopAutoScroll = useCallback(() => {
        if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    }, []);

    const startAutoScroll = useCallback(() => {
        stopAutoScroll();
        lastTimeRef.current = null;

        const step = (timestamp: number) => {
            const el = containerRef.current;
            const firstCopy = firstCopyRef.current;
            if (!el || !firstCopy || isPausedRef.current) return;

            // Measure the actual first-copy width each frame (stays fresh after re-renders)
            const firstCopyWidth = firstCopy.getBoundingClientRect().width;

            // The seamless-loop reset target: how far we need to scroll before snapping back.
            // It equals the width of one copy plus the one flex-gap between the two copies.
            const resetAt = firstCopyWidth + gap;

            // ── Skip scrolling if chips fit in the container ──────────────────────────
            // The reset only works when maxScrollLeft (= scrollWidth – clientWidth) ≥ resetAt.
            // scrollWidth ≈ 2*firstCopyWidth + gap, so:
            //   maxScrollLeft = firstCopyWidth + gap – clientWidth + firstCopyWidth
            //                 = resetAt + firstCopyWidth – clientWidth
            // Condition maxScrollLeft ≥ resetAt  →  firstCopyWidth ≥ clientWidth.
            if (firstCopyWidth < el.clientWidth) {
                // Content fits: keep the rAF alive (re-check on window resize) but don't scroll.
                animFrameRef.current = requestAnimationFrame(step);
                return;
            }

            // ── Delta-time: smooth regardless of frame rate ───────────────────────────
            if (lastTimeRef.current === null) {
                lastTimeRef.current = timestamp;
                animFrameRef.current = requestAnimationFrame(step);
                return; // skip first frame to establish baseline
            }
            const elapsed = Math.min(timestamp - lastTimeRef.current, 50);
            lastTimeRef.current = timestamp;

            // ── Advance scroll ────────────────────────────────────────────────────────
            el.scrollLeft += (speed * elapsed) / 1000;

            // ── Seamless loop ─────────────────────────────────────────────────────────
            // When scrollLeft reaches resetAt we're looking at an exact duplicate of
            // position 0, so snapping back is invisible.
            if (el.scrollLeft >= resetAt) {
                el.scrollLeft -= resetAt;
                // Do NOT reset lastTimeRef here — continuing with the current timestamp
                // avoids a jump on the next frame.
            }

            animFrameRef.current = requestAnimationFrame(step);
        };

        animFrameRef.current = requestAnimationFrame(step);
    }, [speed, gap, stopAutoScroll]);

    const handleInteractionStart = useCallback(() => {
        isPausedRef.current = true;
        stopAutoScroll();
        if (resumeTimerRef.current) {
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = null;
        }
    }, [stopAutoScroll]);

    const handleInteractionEnd = useCallback(() => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => {
            isPausedRef.current = false;
            startAutoScroll();
        }, 3000);
    }, [startAutoScroll]);

    useEffect(() => {
        if (!isMobile) return;
        isPausedRef.current = false;
        // Wait one frame so DOM dimensions are available
        const id = requestAnimationFrame(() => startAutoScroll());
        return () => {
            cancelAnimationFrame(id);
            stopAutoScroll();
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        };
    }, [isMobile, startAutoScroll, stopAutoScroll]);

    // ── Desktop: plain wrap ───────────────────────────────────────────────────────
    if (!isMobile) {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: `${gap}px` }}>
                {children}
            </Box>
        );
    }

    // ── Mobile: infinite horizontal scroll ───────────────────────────────────────
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                // Soft fade on the edges to hint at scrollable content
                maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
        >
            <Box
                ref={containerRef}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: `${gap}px`,
                    pb: 1,
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    userSelect: 'none',
                    // Disable smooth-scroll so programmatic jumps are instant
                    scrollBehavior: 'auto',
                }}
            >
                {/* First copy — ref gives us its exact rendered width */}
                <Box ref={firstCopyRef} sx={{ display: 'flex', gap: `${gap}px`, flexShrink: 0 }}>
                    {children}
                </Box>
                {/* Second copy — mirrors the first so the loop is invisible */}
                <Box sx={{ display: 'flex', gap: `${gap}px`, flexShrink: 0 }} aria-hidden="true">
                    {children}
                </Box>
            </Box>
        </Box>
    );
};
