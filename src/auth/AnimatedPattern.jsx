import Dog from "../assets/dog.svg";
import Utensils from "../assets/utensils.svg";
import Bacon from "../assets/bacon.svg";
import Bread from "../assets/bread.svg";

// Ancho de referencia (px) sobre el que se diseñó el patrón.
// El "size" de cada item se calcula como % de este ancho.
const REFERENCE_WIDTH = 900;

const items = [
  { icon: Dog, left: "-10%", top: "-10%", size: 450, rotate: 20 },
  { icon: Utensils, left: "50%", top: "1%", size: 220, rotate: 35 },
  { icon: Bacon, left: "80%", top: "30%", size: 180, rotate: -80 },

  { icon: Bread, left: "7%", top: "65%", size: 190, rotate: -30 },
  { icon: Dog, left: "30%", top: "77%", size: 200, rotate: -15 },
  { icon: Bread, left: "50%", top: "33%", size: 200, rotate: -30 },

  { icon: Bacon, left: "12%", top: "50%", size: 120, rotate: 10 },
  { icon: Utensils, left: "65%", top: "60%", size: 310, rotate: -40 },

  { icon: Bread, left: "85%", top: "10%", size: 130, rotate: -25 },
];

function Layer({ offset }) {
  return (
    <div
      className="absolute z-0 inset-0"
      style={{ transform: `translateY(${offset}%)` }}
    >
      {items.map((item, index) => (
        <img
          key={index}
          src={item.icon}
          alt=""
          draggable={false}
          className="absolute select-none pointer-events-none"
          style={{
            left: item.left,
            top: item.top,
            width: `${(item.size / REFERENCE_WIDTH) * 100}%`,
            transform: `rotate(${item.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function AnimatedPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 animate-pattern">
        <Layer offset={0} />
        <Layer offset={100} />
      </div>
    </div>
  );
}