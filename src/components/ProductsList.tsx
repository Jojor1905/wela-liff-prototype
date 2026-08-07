import { getProducts } from "@/src/lib/product";

const ProductsList = async () => {
  const data = await getProducts("");

  return (
    <>
      {data.items.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>

          <p>{product.category}</p>

          <p>{product.reason}</p>

          <p>
            {product.condition_names_th.join(", ")}
          </p>

          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              width={150}
            />
          )}
          <hr></hr>
        </div>
      ))}
    </>
  );
};

export default ProductsList;