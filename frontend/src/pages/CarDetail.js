import { useParams } from "react-router-dom";

function CarDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Car Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
}

export default CarDetail;