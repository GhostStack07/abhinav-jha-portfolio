declare module "smartcrop" {
  export interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  export interface CropResult {
    topCrop: Crop;
  }
  export interface CropOptions {
    width: number;
    height: number;
    minScale?: number;
    boost?: { x: number; y: number; width: number; height: number; weight: number }[];
    [key: string]: unknown;
  }
  function crop(
    image: HTMLCanvasElement | HTMLImageElement,
    options: CropOptions
  ): Promise<CropResult>;
  const smartcrop: { crop: typeof crop };
  export default smartcrop;
}
