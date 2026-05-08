export const getDeviceTimezone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone;
