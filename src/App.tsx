/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardConfig,
  BoardElement,
  EraserMode,
  Page,
  PaperSize,
  PenType,
  ShapeType,
  ToolbarDock,
  ToolType,
  BackgroundType
} from './types/emath';
import { Toolbar } from './components/Toolbar';
import { Whiteboard } from './components/Whiteboard';
import { ColorPickerPanel } from './components/ColorPickerPanel';
import { ShapePanel } from './components/ShapePanel';
import { BoardSettingsPanel } from './components/BoardSettingsPanel';
import { FormulaModal } from './components/FormulaModal';
import { GraphModal } from './components/GraphModal';
import { VirtualRuler } from './components/VirtualRuler';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MathAiModal } from './components/MathAiModal';
import { ClassroomToolsModal } from './components/ClassroomToolsModal';
import { exportToPdf, exportToImage } from './utils/pdfExporter';
import { exportToWordDocument, exportToPowerPointSlideDeck } from './utils/officeExporter';
import { getStoredApiKey } from './utils/geminiService';
import {
  autoSaveProject,
  loadAutoSavedProject,
  saveProjectToFile,
  scalePagesToNewSize,
  EMathProject
} from './utils/fileStorage';
import { STROKE_THICKNESSES, CANVAS_DIMENSIONS } from './utils/canvasRenderer';

// Default initial page with elegant math demo
const createInitialPages = (): Page[] => [
  {
    id: 'page_1',
    title: 'Bài Giảng 1',
    elements: [
      // Title
      {
        id: 'title_1',
        type: 'text',
        x: 120,
        y: 80,
        content: 'MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU',
        fontSize: 32,
        color: '#ffffff',
      },
      // Graph Demo (Hàm bậc 3 y = x^3 - 3x)
      {
        id: 'shape_cubic_demo',
        type: 'shape',
        shapeType: 'cubic_function',
        color: '#38bdf8',
        strokeWidth: 2.5,
        startX: 380,
        startY: 320,
        endX: 840,
        endY: 740,
        graphParams: {
          functionType: 'cubic',
          a: 1,
          b: 0,
          c: -3,
          d: 0,
          showAxes: true,
          showPoints: true,
          showFormula: true,
        },
      },
      // Triangle
      {
        id: 'shape_tri',
        type: 'shape',
        shapeType: 'right_triangle',
        color: '#fef08a',
        strokeWidth: 2.5,
        startX: 1100,
        startY: 340,
        endX: 1400,
        endY: 580,
      },
      // Formula
      {
        id: 'formula_1',
        type: 'text',
        x: 1080,
        y: 640,
        content: 'Định lý Pythagoras: a^2 + b^2 = c^2',
        latex: 'a^2 + b^2 = c^2',
        fontSize: 26,
        color: '#fef08a',
        isFormula: true,
      },
    ],
  },
];

export default function App() {
  // Core Whiteboard Configuration
  const [config, setConfig] = useState<BoardConfig>({
    paperSize: '16:9',
    background: 'green_oly',
    viewMode: 'fit_page',
    zoom: 1.0,
    isZoomLocked: false,
    buttonSize: 'normal',
    touchMode: 'all',
  });

  // Pages & Navigation
  const [pages, setPages] = useState<Page[]>(createInitialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Undo / Redo history stack per page
  const [historyStack, setHistoryStack] = useState<BoardElement[][]>([pages[0].elements]);
  const [historyPointer, setHistoryPointer] = useState(0);

  // Toolbar & Subtools
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [penType, setPenType] = useState<PenType>('fountain');
  const [shapeType, setShapeType] = useState<ShapeType>('coordinate_oxy');
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');
  const [isDashed, setIsDashed] = useState(false);
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2.5);

  // Separate Pen & Highlighter Settings
  const [penColor, setPenColor] = useState('#ffffff'); // Chalk white for chalkboard
  const [penThicknessIndex, setPenThicknessIndex] = useState(2); // 4px
  const [highlighterColor, setHighlighterColor] = useState('#fef08a'); // Translucent yellow
  const [highlighterThicknessIndex, setHighlighterThicknessIndex] = useState(4); // 8.5px
  const [highlighterOpacity, setHighlighterOpacity] = useState(0.4);

  // Toolbar Docking
  const [dock, setDock] = useState<ToolbarDock>({
    position: 'top',
    x: 40,
    y: 20,
    isCollapsed: false,
  });

  // Floating Sub-panels
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [colorPanelPos, setColorPanelPos] = useState({ x: 40, y: 80 });

  const [isShapePanelOpen, setIsShapePanelOpen] = useState(false);
  const [shapePanelPos, setShapePanelPos] = useState({ x: 120, y: 80 });

  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [boardSettingsPos, setBoardSettingsPos] = useState({ x: 200, y: 80 });

  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isRulerVisible, setIsRulerVisible] = useState(false);

  // New Educational modals from SKILL EDUCATION & AI Instructions
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMathAiModalOpen, setIsMathAiModalOpen] = useState(false);
  const [isClassroomToolsOpen, setIsClassroomToolsOpen] = useState(false);

  // Hidden File Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Active color based on current pen
  const activeColor = penType === 'highlighter' ? highlighterColor : penColor;

  // Restore Auto-saved project on initial mount if available
  useEffect(() => {
    const saved = loadAutoSavedProject();
    if (saved && saved.pages && saved.pages.length > 0) {
      setPages(saved.pages);
      setConfig(saved.config);
      if (saved.penSettings) {
        setPenThicknessIndex(saved.penSettings.standardThickness || 2);
        setPenColor(saved.penSettings.standardColor || '#ffffff');
        setHighlighterThicknessIndex(saved.penSettings.highlighterThickness || 4);
        setHighlighterColor(saved.penSettings.highlighterColor || '#fef08a');
        setHighlighterOpacity(saved.penSettings.highlighterOpacity || 0.4);
      }
      setHistoryStack([saved.pages[0].elements]);
      setHistoryPointer(0);
    }

    // When user doesn't have an API key yet, automatically show modal per AI_INSTRUCTIONS.md
    const key = getStoredApiKey();
    if (!key) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  // Auto-save on page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSaveProject({
        version: 'BảngVer1.065',
        title: 'MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU',
        timestamp: Date.now(),
        config,
        pages,
        penSettings: {
          standardThickness: penThicknessIndex,
          standardColor: penColor,
          fountainThickness: penThicknessIndex,
          fountainColor: penColor,
          highlighterThickness: highlighterThicknessIndex,
          highlighterColor: highlighterColor,
          highlighterOpacity,
        },
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [pages, config, penThicknessIndex, penColor, highlighterThicknessIndex, highlighterColor, highlighterOpacity]);

  // Current Page
  const currentPage = pages[currentPageIndex] || pages[0];

  // Hotkey 'D' to toggle Dashed line mode (Nét đứt đoạn)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'd' || e.key === 'D') {
        setIsDashed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update elements with Undo/Redo tracking
  const handleUpdateElements = useCallback((newElements: BoardElement[]) => {
    setPages((prev) => {
      const updated = [...prev];
      updated[currentPageIndex] = {
        ...updated[currentPageIndex],
        elements: newElements,
      };
      return updated;
    });

    // Push to undo stack
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyPointer + 1);
      return [...sliced, newElements];
    });
    setHistoryPointer((prev) => prev + 1);
  }, [currentPageIndex, historyPointer]);

  // Undo & Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      const prevElements = historyStack[newPointer];
      setHistoryPointer(newPointer);
      setPages((prev) => {
        const updated = [...prev];
        updated[currentPageIndex] = {
          ...updated[currentPageIndex],
          elements: prevElements,
        };
        return updated;
      });
    }
  }, [historyPointer, historyStack, currentPageIndex]);

  const handleRedo = useCallback(() => {
    if (historyPointer < historyStack.length - 1) {
      const newPointer = historyPointer + 1;
      const nextElements = historyStack[newPointer];
      setHistoryPointer(newPointer);
      setPages((prev) => {
        const updated = [...prev];
        updated[currentPageIndex] = {
          ...updated[currentPageIndex],
          elements: nextElements,
        };
        return updated;
      });
    }
  }, [historyPointer, historyStack, currentPageIndex]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'p' || e.key === 'P') {
        setCurrentTool('pen');
      } else if (e.key === 'e' || e.key === 'E') {
        setCurrentTool('eraser');
      } else if (e.key === 's' || e.key === 'S') {
        setCurrentTool('shape');
        setIsShapePanelOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        setCurrentTool('text');
        setIsFormulaModalOpen(true);
      } else if (e.key === 'l' || e.key === 'L') {
        setCurrentTool('laser');
      } else if (e.key === 'r' || e.key === 'R') {
        setIsRulerVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Page Navigation Handlers
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      const newIdx = currentPageIndex - 1;
      setCurrentPageIndex(newIdx);
      setHistoryStack([pages[newIdx].elements]);
      setHistoryPointer(0);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      const newIdx = currentPageIndex + 1;
      setCurrentPageIndex(newIdx);
      setHistoryStack([pages[newIdx].elements]);
      setHistoryPointer(0);
    }
  };

  const handleAddPage = () => {
    const newPage: Page = {
      id: 'page_' + (pages.length + 1) + '_' + Date.now(),
      title: `Bài Giảng ${pages.length + 1}`,
      elements: [],
    };
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    setHistoryStack([[]]);
    setHistoryPointer(0);
  };

  // Zoom Controls
  const handleZoomIn = () => {
    if (!config.isZoomLocked) {
      setConfig((prev) => ({ ...prev, zoom: Math.min(2.5, prev.zoom + 0.15) }));
    }
  };

  const handleZoomOut = () => {
    if (!config.isZoomLocked) {
      setConfig((prev) => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.15) }));
    }
  };

  const handleToggleLockZoom = () => {
    setConfig((prev) => ({ ...prev, isZoomLocked: !prev.isZoomLocked }));
  };

  const handleToggleViewMode = () => {
    setConfig((prev) => ({
      ...prev,
      viewMode: prev.viewMode === 'fit_page' ? 'fit_width' : 'fit_page',
    }));
  };

  // Select Paper Size with automatic element re-scaling as required by spec!
  const handleSelectPaperSize = (newSize: PaperSize) => {
    if (newSize === config.paperSize) return;
    const scaledPages = scalePagesToNewSize(pages, config.paperSize, newSize);
    setPages(scaledPages);
    setConfig((prev) => ({ ...prev, paperSize: newSize }));
    setHistoryStack([scaledPages[currentPageIndex]?.elements || []]);
    setHistoryPointer(0);
  };

  // Select Background & adjust default chalk colors
  const handleSelectBackground = (bg: BackgroundType) => {
    setConfig((prev) => ({ ...prev, background: bg }));
    // Automatically switch default chalk/pen color for optimal contrast
    if (bg === 'white' || bg === 'ruled' || bg === 'oly' || bg === 'grid') {
      if (penColor === '#ffffff' || penColor === '#fef08a') {
        setPenColor('#0f172a'); // Black ink for white paper
      }
    } else {
      if (penColor === '#0f172a' || penColor === '#1e293b') {
        setPenColor('#ffffff'); // White chalk for chalkboard
      }
    }
  };

  // Insert Text or KaTeX Formula
  const handleInsertText = (content: string, isFormula: boolean, latex?: string, fontSize: number = 24) => {
    const dim = CANVAS_DIMENSIONS[config.paperSize];
    const newTextElement: BoardElement = {
      id: 'text_' + Date.now(),
      type: 'text',
      x: dim.width * 0.25,
      y: dim.height * 0.4,
      content,
      latex,
      isFormula,
      fontSize,
      color: activeColor,
    };
    handleUpdateElements([...currentPage.elements, newTextElement]);
  };

  // Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dim = CANVAS_DIMENSIONS[config.paperSize];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const img = new Image();
          img.onload = () => {
            const maxW = dim.width * 0.5;
            const scale = Math.min(1, maxW / img.width);
            const newImgElement: BoardElement = {
              id: 'img_' + Date.now(),
              type: 'image',
              dataUrl,
              x: (dim.width - img.width * scale) / 2,
              y: (dim.height - img.height * scale) / 2,
              width: img.width * scale,
              height: img.height * scale,
            };
            handleUpdateElements([...currentPage.elements, newImgElement]);
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Support pasting image directly from clipboard (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const dim = CANVAS_DIMENSIONS[config.paperSize];
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                  const maxW = dim.width * 0.5;
                  const scale = Math.min(1, maxW / img.width);
                  const newImgElement: BoardElement = {
                    id: 'img_' + Date.now(),
                    type: 'image',
                    dataUrl,
                    x: (dim.width - img.width * scale) / 2,
                    y: (dim.height - img.height * scale) / 2,
                    width: img.width * scale,
                    height: img.height * scale,
                  };
                  handleUpdateElements([...currentPage.elements, newImgElement]);
                };
                img.src = dataUrl;
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [config.paperSize, currentPage.elements, handleUpdateElements]);

  // Insert AI Generated Text / Formula onto the active board
  const handleInsertAiToBoard = (text: string, isFormula = false, latex?: string) => {
    const dim = CANVAS_DIMENSIONS[config.paperSize];
    const newElement: BoardElement = {
      id: 'ai_text_' + Date.now(),
      type: 'text',
      x: dim.width * 0.1,
      y: dim.height * 0.25,
      content: text,
      isFormula,
      latex,
      fontSize: 22,
      color: activeColor,
    };
    handleUpdateElements([...currentPage.elements, newElement]);
  };

  // Export to PDF
  const handleExportPdf = () => {
    exportToPdf(pages, config.paperSize, config.background, `MATHEMATICS_INTERACTIVE_BOARD_PHAM_HAU_${config.paperSize}_BaiGiang.pdf`);
  };

  // Export to PowerPoint Slides (.pptx)
  const handleExportPowerPoint = () => {
    exportToPowerPointSlideDeck(pages, config.paperSize, config.background, `MATHEMATICS_INTERACTIVE_BOARD_PHAM_HAU_Slides.html`);
  };

  // Export to Word Document (.docx / .doc)
  const handleExportWord = () => {
    exportToWordDocument(pages, config.paperSize, config.background, `MATHEMATICS_INTERACTIVE_BOARD_PHAM_HAU_GiaoAn.doc`);
  };

  // Export to PNG Image
  const handleExportImage = () => {
    exportToImage(currentPage, config.paperSize, config.background, `MATHEMATICS_INTERACTIVE_BOARD_PHAM_HAU_Trang_${currentPageIndex + 1}.png`);
  };

  // Save Project (.emath)
  const handleSaveProject = () => {
    saveProjectToFile({
      version: 'BảngVer1.065',
      title: 'MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU',
      timestamp: Date.now(),
      config,
      pages,
      penSettings: {
        standardThickness: penThicknessIndex,
        standardColor: penColor,
        fountainThickness: penThicknessIndex,
        fountainColor: penColor,
        highlighterThickness: highlighterThicknessIndex,
        highlighterColor: highlighterColor,
        highlighterOpacity,
      },
    }, `MATHEMATICS_INTERACTIVE_BOARD_PHAM_HAU_${Date.now()}.emath`);
  };

  // Insert Mathematical Function Graph
  const handleInsertGraph = (graphElement: ShapeElement) => {
    handleUpdateElements([...currentPage.elements, graphElement]);
  };

  // Load Project (.emath)
  const handleLoadProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const project: EMathProject = JSON.parse(ev.target?.result as string);
          if (project.pages && project.pages.length > 0) {
            setPages(project.pages);
            setCurrentPageIndex(0);
            if (project.config) setConfig(project.config);
            setHistoryStack([project.pages[0].elements]);
            setHistoryPointer(0);
          }
        } catch (err) {
          alert('Không thể mở file .emath: Tệp không đúng định dạng!');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 flex flex-col">
      {/* Top Header Bar per AI_INSTRUCTIONS.md */}
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenMathAiModal={() => setIsMathAiModalOpen(true)}
        onOpenClassroomTools={() => setIsClassroomToolsOpen(true)}
        currentPageIndex={currentPageIndex}
        totalPages={pages.length}
      />

      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLoadProjectFile}
        accept=".emath,application/json"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Interactive Whiteboard */}
      <div className="flex-1 w-full h-full relative">
        <Whiteboard
          config={config}
          page={currentPage}
          currentTool={currentTool}
          penType={penType}
          shapeType={shapeType}
          eraserMode={eraserMode}
          isDashed={isDashed}
          activeColor={activeColor}
          penThicknessIndex={penThicknessIndex}
          highlighterThicknessIndex={highlighterThicknessIndex}
          highlighterOpacity={highlighterOpacity}
          shapeStrokeWidth={shapeStrokeWidth}
          onUpdateElements={handleUpdateElements}
        />
      </div>

      {/* Floating Draggable & Dockable Toolbar */}
      <Toolbar
        currentTool={currentTool}
        penType={penType}
        shapeType={shapeType}
        eraserMode={eraserMode}
        dock={dock}
        buttonSize={config.buttonSize}
        zoom={config.zoom}
        isZoomLocked={config.isZoomLocked}
        viewMode={config.viewMode}
        canUndo={historyPointer > 0}
        canRedo={historyPointer < historyStack.length - 1}
        currentPageIndex={currentPageIndex}
        totalPages={pages.length}
        isColorPanelOpen={isColorPanelOpen}
        isShapePanelOpen={isShapePanelOpen}
        isBoardSettingsOpen={isBoardSettingsOpen}
        isFormulaModalOpen={isFormulaModalOpen}
        activeColor={activeColor}
        isDashed={isDashed}
        onToggleDashed={() => setIsDashed((prev) => !prev)}
        onSelectTool={(tool) => {
          setCurrentTool(tool);
          if (tool === 'ruler') setIsRulerVisible((prev) => !prev);
        }}
        onSetDock={setDock}
        onToggleColorPanel={() => setIsColorPanelOpen((prev) => !prev)}
        onToggleShapePanel={() => setIsShapePanelOpen((prev) => !prev)}
        onToggleBoardSettings={() => setIsBoardSettingsOpen((prev) => !prev)}
        onOpenFormulaModal={() => setIsFormulaModalOpen(true)}
        onOpenGraphModal={() => setIsGraphModalOpen(true)}
        onOpenImageUpload={() => imageInputRef.current?.click()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleLockZoom={handleToggleLockZoom}
        onToggleViewMode={handleToggleViewMode}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onAddPage={handleAddPage}
        onSaveProject={handleSaveProject}
        onLoadProject={() => fileInputRef.current?.click()}
        onExportPdf={handleExportPdf}
        onExportImage={handleExportImage}
      />

      {/* Floating Color & Thickness Panel */}
      <ColorPickerPanel
        isOpen={isColorPanelOpen}
        onClose={() => setIsColorPanelOpen(false)}
        background={config.background}
        penType={penType}
        onSelectPenType={setPenType}
        penColor={penColor}
        onSelectPenColor={setPenColor}
        penThicknessIndex={penThicknessIndex}
        onSelectPenThicknessIndex={setPenThicknessIndex}
        highlighterColor={highlighterColor}
        onSelectHighlighterColor={setHighlighterColor}
        highlighterThicknessIndex={highlighterThicknessIndex}
        onSelectHighlighterThicknessIndex={setHighlighterThicknessIndex}
        highlighterOpacity={highlighterOpacity}
        onChangeHighlighterOpacity={setHighlighterOpacity}
        isDashed={isDashed}
        onToggleDashed={() => setIsDashed((prev) => !prev)}
        position={colorPanelPos}
        onUpdatePosition={setColorPanelPos}
      />

      {/* Floating Math Shapes Panel */}
      <ShapePanel
        isOpen={isShapePanelOpen}
        onClose={() => setIsShapePanelOpen(false)}
        selectedShape={shapeType}
        onSelectShape={(st) => {
          setShapeType(st);
          setCurrentTool('shape');
        }}
        isDashed={isDashed}
        onToggleDashed={() => setIsDashed((prev) => !prev)}
        strokeWidth={shapeStrokeWidth}
        onChangeStrokeWidth={setShapeStrokeWidth}
        position={shapePanelPos}
        onUpdatePosition={setShapePanelPos}
        onOpenGraphModal={() => setIsGraphModalOpen(true)}
      />

      {/* Floating Board Settings & Paper Size Panel */}
      <BoardSettingsPanel
        isOpen={isBoardSettingsOpen}
        onClose={() => setIsBoardSettingsOpen(false)}
        config={config}
        onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
        onSelectPaperSize={handleSelectPaperSize}
        onSelectBackground={handleSelectBackground}
        onExportPdf={handleExportPdf}
        onExportPowerPoint={handleExportPowerPoint}
        onExportWord={handleExportWord}
        onExportImage={handleExportImage}
        onSaveProject={handleSaveProject}
        onLoadProject={() => fileInputRef.current?.click()}
        position={boardSettingsPos}
        onUpdatePosition={setBoardSettingsPos}
      />

      {/* LaTeX & Text Insertion Modal */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onInsertText={handleInsertText}
        defaultColor={activeColor}
      />

      {/* Function Graph Plotter Modal (Hàm bậc 3, Nhất biến, Bậc 2/1) */}
      <GraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        onInsertGraph={handleInsertGraph}
        defaultColor={activeColor}
        canvasWidth={CANVAS_DIMENSIONS[config.paperSize].width}
        canvasHeight={CANVAS_DIMENSIONS[config.paperSize].height}
      />

      {/* Virtual Ruler & Protractor */}
      <VirtualRuler
        isVisible={isRulerVisible}
        onClose={() => setIsRulerVisible(false)}
      />

      {/* Google Gemini Model & API Key Modal per AI_INSTRUCTIONS.md */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* AI Pedagogical Math Assistant (3-Step Solution & Similar Problems) */}
      <MathAiModal
        isOpen={isMathAiModalOpen}
        onClose={() => setIsMathAiModalOpen(false)}
        onRequireApiKey={() => setIsApiKeyModalOpen(true)}
        onInsertToBoard={handleInsertAiToBoard}
      />

      {/* Classroom Interactive Gamification Tools (Lucky Wheel & Timer) */}
      <ClassroomToolsModal
        isOpen={isClassroomToolsOpen}
        onClose={() => setIsClassroomToolsOpen(false)}
      />
    </div>
  );
}
