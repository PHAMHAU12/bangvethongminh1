/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardConfig, Page, PaperSize, BoardElement } from '../types/emath';
import { CANVAS_DIMENSIONS } from './canvasRenderer';

export interface EMathProject {
  version: 'BảngVer1.065';
  title: string;
  timestamp: number;
  config: BoardConfig;
  pages: Page[];
  penSettings?: {
    standardThickness: number;
    standardColor: string;
    fountainThickness: number;
    fountainColor: string;
    highlighterThickness: number;
    highlighterColor: string;
    highlighterOpacity: number;
  };
}

const LOCAL_STORAGE_KEY = 'emath_board_autosave_v1065';

/**
 * Auto-saves project state to browser localStorage
 */
export function autoSaveProject(project: EMathProject) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    console.warn('Auto-save failed:', err);
  }
}

/**
 * Loads auto-saved project from localStorage
 */
export function loadAutoSavedProject(): EMathProject | null {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.warn('Auto-load failed:', err);
    return null;
  }
}

/**
 * Downloads the project file as .emath (JSON)
 */
export function saveProjectToFile(project: EMathProject, fileName: string = 'BaiGiang.emath') {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Scales all elements when switching paper size to fit the new dimensions
 */
export function scalePagesToNewSize(
  pages: Page[],
  oldSize: PaperSize,
  newSize: PaperSize
): Page[] {
  if (oldSize === newSize) return pages;

  const oldDim = CANVAS_DIMENSIONS[oldSize];
  const newDim = CANVAS_DIMENSIONS[newSize];

  const scaleX = newDim.width / oldDim.width;
  const scaleY = newDim.height / oldDim.height;
  const avgScale = (scaleX + scaleY) / 2;

  return pages.map((page) => ({
    ...page,
    elements: page.elements.map((el) => {
      if (el.type === 'stroke') {
        return {
          ...el,
          thickness: Math.max(1, el.thickness * avgScale),
          points: el.points.map((pt) => ({
            ...pt,
            x: pt.x * scaleX,
            y: pt.y * scaleY,
          })),
        };
      } else if (el.type === 'shape') {
        return {
          ...el,
          strokeWidth: Math.max(1, el.strokeWidth * avgScale),
          startX: el.startX * scaleX,
          startY: el.startY * scaleY,
          endX: el.endX * scaleX,
          endY: el.endY * scaleY,
        };
      } else if (el.type === 'text') {
        return {
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          fontSize: Math.max(10, el.fontSize * avgScale),
        };
      } else if (el.type === 'image') {
        return {
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          width: el.width * scaleX,
          height: el.height * scaleY,
        };
      }
      return el;
    }),
  }));
}
