export const getScreenSize = () => ({
  x:
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth,
  y:
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight,
});
