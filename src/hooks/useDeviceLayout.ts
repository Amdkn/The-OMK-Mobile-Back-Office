import React, { useState, useEffect } from 'react';
import { useOSStore, DeviceViewMode } from '../store/osStore';
import { DeviceOrientation, DeviceFormFactor } from '../types';

export interface DeviceLayoutConfig {
  orientation: DeviceOrientation;
  isLandscape: boolean;
  isPortrait: boolean;
  isTablet: boolean;
  isCompact: boolean;
  gridCols: number;
  widgetCols: number;
  contentCols: number;
  containerPadding: string;
  appViewerPadding: {
    headerHeight: string;
    headerMarginTop: string;
    headerPadding: string;
    bodyPadding: string;
    backBtnWidth: string;
    actionsWidth: string;
  };
  formFactor: DeviceFormFactor;
  width: number;
  height: number;
}

export function useDeviceLayout(containerRef?: React.RefObject<HTMLElement | null>): DeviceLayoutConfig {
  const deviceViewMode = useOSStore(state => state.deviceViewMode);

  const calculateLayout = (): DeviceLayoutConfig => {
    let width = typeof window !== 'undefined' ? window.innerWidth : 390;
    let height = typeof window !== 'undefined' ? window.innerHeight : 844;

    if (containerRef && containerRef.current) {
      width = containerRef.current.clientWidth || width;
      height = containerRef.current.clientHeight || height;
    }

    // 1. Manual OS Switch overrides
    if (deviceViewMode === 'landscape') {
      return {
        orientation: 'landscape',
        isLandscape: true,
        isPortrait: false,
        isTablet: false,
        isCompact: false,
        gridCols: 6,
        widgetCols: 4,
        contentCols: 2,
        containerPadding: 'px-4 pt-10 pb-3',
        appViewerPadding: {
          headerHeight: 'pt-11 pb-2',
          headerMarginTop: '',
          headerPadding: 'px-3.5',
          bodyPadding: 'p-3',
          backBtnWidth: 'w-[68px]',
          actionsWidth: 'w-[100px]'
        },
        formFactor: 'phone',
        width,
        height
      };
    }

    if (deviceViewMode === 'tablet') {
      return {
        orientation: 'landscape',
        isLandscape: true,
        isPortrait: false,
        isTablet: true,
        isCompact: false,
        gridCols: 6,
        widgetCols: 3,
        contentCols: 3,
        containerPadding: 'px-6 pt-12 pb-5',
        appViewerPadding: {
          headerHeight: 'pt-12 pb-2.5',
          headerMarginTop: '',
          headerPadding: 'px-5',
          bodyPadding: 'p-5',
          backBtnWidth: 'w-[80px]',
          actionsWidth: 'w-[120px]'
        },
        formFactor: 'tablet',
        width,
        height
      };
    }

    if (deviceViewMode === 'portrait') {
      return {
        orientation: 'portrait',
        isLandscape: false,
        isPortrait: true,
        isTablet: false,
        isCompact: width < 380,
        gridCols: 4,
        widgetCols: 2,
        contentCols: 1,
        containerPadding: 'px-6 pt-14 pb-5',
        appViewerPadding: {
          headerHeight: 'pt-14 pb-2.5',
          headerMarginTop: '',
          headerPadding: 'px-4',
          bodyPadding: 'p-4',
          backBtnWidth: 'w-[70px]',
          actionsWidth: 'w-[110px]'
        },
        formFactor: 'phone',
        width,
        height
      };
    }

    // 2. Hardware / Viewport Native detection
    const isWindowLandscape = width > height;
    const isTabletWidth = width >= 768 && width <= 1024;
    const isDesktopWidth = width > 1024;

    const orientation: DeviceOrientation = isWindowLandscape ? 'landscape' : 'portrait';
    const isLandscape = isWindowLandscape;
    const isPortrait = !isWindowLandscape;
    const isTablet = isTabletWidth || (isWindowLandscape && width >= 600 && height >= 600);
    const isCompact = width < 380;

    let gridCols = 4;
    let widgetCols = 2;
    let contentCols = 1;
    let formFactor: DeviceFormFactor = 'phone';

    if (isTablet) {
      formFactor = 'tablet';
      gridCols = isLandscape ? 6 : 5;
      widgetCols = isLandscape ? 3 : 2;
      contentCols = isLandscape ? 3 : 2;
    } else if (isLandscape) {
      gridCols = 6;
      widgetCols = 3;
      contentCols = 2;
    } else {
      gridCols = 4;
      widgetCols = 2;
      contentCols = 1;
    }

    return {
      orientation,
      isLandscape,
      isPortrait,
      isTablet,
      isCompact,
      gridCols,
      widgetCols,
      contentCols,
      containerPadding: isLandscape ? 'px-4 pt-10 pb-3' : 'px-6 pt-14 pb-5',
      appViewerPadding: {
        headerHeight: isLandscape ? 'pt-11 pb-2' : 'pt-14 pb-2.5',
        headerMarginTop: '',
        headerPadding: isLandscape ? 'px-3.5' : 'px-4',
        bodyPadding: isLandscape ? 'p-3' : 'p-4',
        backBtnWidth: isLandscape ? 'w-[68px]' : 'w-[70px]',
        actionsWidth: isLandscape ? 'w-[100px]' : 'w-[110px]'
      },
      formFactor: isDesktopWidth ? 'desktop' : formFactor,
      width,
      height
    };
  };

  const [layout, setLayout] = useState<DeviceLayoutConfig>(calculateLayout);

  useEffect(() => {
    const handleUpdate = () => {
      setLayout(calculateLayout());
    };

    handleUpdate();

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleUpdate);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef && containerRef.current) {
      resizeObserver = new ResizeObserver(handleUpdate);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleUpdate);
      }
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [deviceViewMode, containerRef?.current]);

  return layout;
}
