import {
  useLayoutEffect,
  type RefObject,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

type MotionProps = {
  root: RefObject<HTMLElement | null>;
};

export function LandingMotion({ root }: MotionProps) {
  useLayoutEffect(() => {
    if (
      !root.current ||
      window.matchMedia(reducedMotionQuery).matches
    ) {
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      timeline
        .from(".landing-nav", {
          autoAlpha: 0,
          y: -10,
          duration: 0.5,
        })
        .from(
          [
            ".landing-kicker",
            ".landing-copy h1",
            ".landing-intro",
            ".landing-cta-row",
          ],
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.58,
            stagger: 0.07,
          },
          "-=0.28",
        )
        .from(
          ".landing-proof",
          {
            autoAlpha: 0,
            y: 10,
            duration: 0.42,
          },
          "-=0.24",
        );
    }, root);

    return () => context.revert();
  }, [root]);

  return null;
}

export function GardenMotion({ root }: MotionProps) {
  useLayoutEffect(() => {
    if (
      !root.current ||
      window.matchMedia(reducedMotionQuery).matches
    ) {
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          autoAlpha: 0,
          duration: 0.48,
          ease: "power3.out",
        },
      });

      timeline
        .from(".topbar", { y: -8 })
        .from(
          [
            ".source-label",
            ".garden-heading h1",
            ".garden-heading > p",
          ],
          { y: 16, stagger: 0.06 },
          "-=0.24",
        )
        .from(".garden-search", { y: 14 }, "-=0.34")
        .from(".garden-stats", { y: 12 }, "-=0.28");

      gsap.from(".garden-wrap", {
        autoAlpha: 0,
        y: 20,
        duration: 0.62,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".garden-workspace",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".field-notes", {
        autoAlpha: 0,
        x: 16,
        duration: 0.52,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".garden-workspace",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".plot", {
        autoAlpha: 0,
        duration: 0.34,
        stagger: { each: 0.025, from: "random" },
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".garden-world",
          start: "top 88%",
          once: true,
        },
      });
    }, root);

    return () => context.revert();
  }, [root]);

  return null;
}
