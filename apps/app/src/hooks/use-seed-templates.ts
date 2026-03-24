"use client";

import { useEffect, useRef } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";

/**
 * Seeds the agent state with built-in templates on first load
 * if no templates exist yet.
 */
export function useSeedTemplates() {
  const { agent } = useAgent();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    const existing = agent.state?.templates;
    // Only seed if templates array is empty or absent
    if (existing && existing.length > 0) {
      seeded.current = true;
      return;
    }
    seeded.current = true;
    agent.setState({
      ...agent.state,
      templates: [...SEED_TEMPLATES],
    });
  }, [agent]);
}
