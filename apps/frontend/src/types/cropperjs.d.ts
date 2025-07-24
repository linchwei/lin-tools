declare module "cropperjs" {
  export default class Cropper {
    constructor(
      element: HTMLImageElement | HTMLCanvasElement,
      options?: Cropper.Options
    );

    destroy(): void;
    rotate(degree: number): Cropper;
    scaleX(scaleX: number): Cropper;
    scaleY(scaleY: number): Cropper;
    reset(): Cropper;
    setAspectRatio(aspectRatio: number): Cropper;
    getCroppedCanvas(
      options?: Cropper.GetCroppedCanvasOptions
    ): HTMLCanvasElement;
    getImageData(): Cropper.ImageData;

    static noConflict(): typeof Cropper;
    static setDefaults(options: Cropper.Options): void;
  }

  namespace Cropper {
    interface Options {
      aspectRatio?: number;
      viewMode?: number;
      dragMode?: string;
      autoCropArea?: number;
      restore?: boolean;
      guides?: boolean;
      center?: boolean;
      highlight?: boolean;
      cropBoxMovable?: boolean;
      cropBoxResizable?: boolean;
      toggleDragModeOnDblclick?: boolean;
    }

    interface GetCroppedCanvasOptions {
      width?: number;
      height?: number;
      imageSmoothingEnabled?: boolean;
      imageSmoothingQuality?: string;
    }

    interface ImageData {
      scaleX: number;
      scaleY: number;
    }
  }
}
