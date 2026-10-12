"use client";

import { useEffect, useState, useCallback } from "react";
import { oceanStore, OceanState } from "@/lib/oceanStore";

export function useOceanState(): OceanState {
  const [state, setState] = useState<OceanState>(() => oceanStore.getState());

  useEffect(() => {
    return oceanStore.subscribe((next) => {
      setState(next);
    });
  }, []);

  return state;
}

export function useCalm(): [boolean, (val?: boolean) => void] {
  const [calm, setCalmState] = useState<boolean>(() => oceanStore.isCalm());

  useEffect(() => {
    return oceanStore.subscribe((next) => {
      setCalmState(next.calm);
    });
  }, []);

  const toggle = useCallback((val?: boolean) => {
    if (typeof val === "boolean") {
      oceanStore.setCalm(val);
    } else {
      oceanStore.toggleCalm();
    }
  }, []);

  return [calm, toggle];
}

export function useActiveSkill(): [string, (skill: string) => void] {
  const [activeSkill, setSkillState] = useState<string>(() => oceanStore.getActiveSkill());

  useEffect(() => {
    return oceanStore.subscribe((next) => {
      setSkillState(next.activeSkill);
    });
  }, []);

  const setSkill = useCallback((skill: string) => {
    oceanStore.setActiveSkill(skill);
  }, []);

  return [activeSkill, setSkill];
}
