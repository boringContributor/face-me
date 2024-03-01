declare module "solid-js" {
    namespace JSX {
      interface Directives {
        getVideoSrc(el: HTMLVideoElement, accessor: () => MediaStream | null): void;
      }
    }
  }
  
  