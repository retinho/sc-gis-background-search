import type { React } from 'jimu-core';

type TCalciteElementProps = React.HTMLAttributes<HTMLElement> & {
  disabled?: boolean;
  label?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'calcite-button': TCalciteElementProps & { appearance?: 'outline' | 'solid' | 'transparent'; kind?: 'brand' | 'danger' | 'neutral' | 'inverse'; loading?: boolean; width?: 'auto' | 'full'; 'icon-start'?: string };
      'calcite-input': TCalciteElementProps & { type?: 'color' | 'number' | 'text' | 'url'; value?: string; min?: string; step?: string };
      'calcite-label': TCalciteElementProps;
      'calcite-loader': TCalciteElementProps & { active?: boolean; inline?: boolean; scale?: 's' | 'm' | 'l' };
      'calcite-notice': TCalciteElementProps & { icon?: boolean; kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning'; open?: boolean };
    }
  }
}

export {};
