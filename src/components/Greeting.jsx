export default function Greeting({ name }) {
  return (
    <div className="greeting">
      <h1>WELCOME {name ? name.toUpperCase() : ""}</h1>
    </div>
  );
}