import type { ImmutableObject, Expression, DynamicStyleConfig } from 'jimu-core'

interface Style {
  wrap?: boolean
  color?: string
  enableDynamicStyle: boolean
  dynamicStyleConfig?: DynamicStyleConfig
}

export interface Threshold {
  value: number
  color: string
}

export interface Config {
  /**
   * Note: The placeholder must be a nested structure of tags with the text inside:
   *   Correct: <p><strong>foo</strong></p>
   *   Wrong:   <p>foo<strong>bar</strong></p>
   */
  placeholder?: string
  text: string
  style?: Style
  tooltip?: Expression
  showSpeedometer?: boolean
  speedometerGaugeColor?: string
  speedometerNeedleColor?: string
  speedometerTextColor?: string
  speedometerTextFont?: string
  speedometerTextSize?: number
  speedometerTextBold?: boolean
  speedometerTickColor?: string
  speedometerTickFont?: string
  speedometerTickSize?: number
  speedometerPadding?: number
  speedometerThresholds?: Threshold[]
}

export type IMConfig = ImmutableObject<Config>

export interface WidgetState {
  showExpression?: boolean
  isInlineEditing?: boolean
  showArcade?: boolean
  canAddArcadeContent?: boolean
}

export type IMWidgetState = ImmutableObject<WidgetState>
