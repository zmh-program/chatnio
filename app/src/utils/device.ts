export let mobile = isMobile();

window.addEventListener("resize", () => {
  mobile = isMobile();
});

export function isMobile(): boolean {
  return (
    (document.documentElement.clientWidth || window.innerWidth) <= 668 ||
    (document.documentElement.clientHeight || window.innerHeight) <= 468 ||
    navigator.userAgent.includes("Mobile")
  );
}
