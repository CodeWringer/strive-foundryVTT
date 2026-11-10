import BaseAnimation from "./base-anim.mjs";
import { ScaleVInAnim } from "./scale-v-in-anim.mjs";
import { ScaleVOutAnim } from "./scale-v-out-anim.mjs";
import { SlideDisplaceAnim } from "./slide-displace-anim.mjs";
import { SlideInFromTopAnim } from "./slide-in-from-top-anim.mjs";
import { SlideOutToBottomAnim } from "./slide-out-to-bottom-anim.mjs";
import { SlideOutToTopAnim } from "./slide-out-to-top-anim.mjs";

export const animation = {
  BaseAnimation: BaseAnimation,
  SlideDisplaceAnim: SlideDisplaceAnim,
  SlideInFromTopAnim: SlideInFromTopAnim,
  SlideOutToBottomAnim: SlideOutToBottomAnim,
  SlideOutToTopAnim: SlideOutToTopAnim,
  ScaleVInAnim: ScaleVInAnim,
  ScaleVOutAnim: ScaleVOutAnim,
};