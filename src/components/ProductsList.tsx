import { Fragment } from "react";
import { mockProducts } from "@/src/data/mock-products";

const ProductsList = () => {
  return (
    <>
      {mockProducts.map((element) => (
        <Fragment key={element.id}>
          <h1>{element.name}</h1>
          <p>{element.price}</p>
        </Fragment>
      ))}
    </>
  );
};

export default ProductsList;