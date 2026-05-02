/** @deprecated Import from `lessonMediaOverrides.js` instead */
export {
  VIDEO_OVERRIDES_KEY,
  readVideoApprovalOverrides,
  readVideoOverrides,
  setLessonVideoOverride,
  makeLessonVideoKey,
  mergeLessonVideo,
  mergeLessonWithLocalOverrides,
  isVideoApprovedForDisplay,
  dispatchLessonOverridesUpdated as dispatchVideoApprovalUpdated,
  LESSON_OVERRIDES_EVENT,
} from './lessonMediaOverrides'
