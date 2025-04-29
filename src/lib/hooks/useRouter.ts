export function useRouter() {
  const push = (path: string) => {
    window.location.href = path;
  };

  return {
    push,
  };
}
