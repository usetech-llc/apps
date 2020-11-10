export interface ImageInterface {
  address: string;
  image: string; // base64;
  name: string;
}

export interface PunkForSaleInterface {
  id: string;
  isOwned: boolean;
  my: boolean;
  price: string;
}
