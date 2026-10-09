import type { Archetype } from "../lib/workspace";
export default function Portrait({
  archetype,
  small = false,
}: {
  archetype: Archetype;
  small?: boolean;
}) {
  const colors = {
    warrior: "#bd8858",
    mage: "#a18abd",
    archer: "#87a078",
    swordsman: "#c5a575",
    healer: "#c8c8ad",
  };
  const color = colors[archetype];
  return (
    <svg
      className={small ? "portrait small" : "portrait"}
      viewBox="0 0 120 125"
      role="img"
      aria-label={`${archetype} character appearance`}
    >
      <ellipse cx="60" cy="113" rx="30" ry="5" fill="#584637" opacity=".1" />
      <path
        d="M39 75L27 108Q60 118 93 108L81 75Z"
        fill={archetype === "warrior" ? "#a85748" : color}
      />
      <rect x="44" y="83" width="13" height="27" rx="5" fill="#73594a" />
      <rect x="63" y="83" width="13" height="27" rx="5" fill="#73594a" />
      <rect x="42" y="102" width="17" height="9" rx="4" fill="#614c41" />
      <rect x="61" y="102" width="17" height="9" rx="4" fill="#614c41" />
      <rect x="39" y="67" width="42" height="31" rx="12" fill={color} />
      <rect x="39" y="88" width="42" height="5" rx="2" fill="#7d6246" />
      <rect x="56" y="87" width="9" height="8" rx="1" fill="#dec58a" />
      <ellipse cx="34" cy="79" rx="8" ry="13" fill={color} />
      <ellipse cx="86" cy="79" rx="8" ry="13" fill={color} />
      <circle cx="33" cy="91" r="6" fill="#ebc5a4" />
      <circle cx="87" cy="91" r="6" fill="#ebc5a4" />
      {archetype === "warrior" && (
        <>
          <ellipse cx="34" cy="73" rx="11" ry="7" fill="#c7a371" />
          <ellipse cx="86" cy="73" rx="11" ry="7" fill="#c7a371" />
        </>
      )}
      <ellipse
        cx="60"
        cy="47"
        rx="29"
        ry="28"
        fill={archetype === "swordsman" ? "#c5b28a" : "#78583f"}
      />
      <ellipse cx="60" cy="52" rx="26" ry="23" fill="#efd0b0" />
      <path
        d="M34 40Q34 18 65 21Q87 22 88 42L79 40L70 30L63 42L55 33L44 43Z"
        fill={
          archetype === "mage"
            ? "#806b9e"
            : archetype === "swordsman"
              ? "#d4c39b"
              : "#78583f"
        }
      />
      {archetype === "archer" && (
        <path
          d="M30 49Q25 16 60 16Q94 17 90 49L80 33Q57 24 39 40Z"
          fill={color}
        />
      )}
      <ellipse cx="49" cy="53" rx="3" ry="4" fill="#413a32" />
      <ellipse cx="71" cy="53" rx="3" ry="4" fill="#413a32" />
      <ellipse cx="42" cy="60" rx="5" ry="2" fill="#dfae94" />
      <ellipse cx="78" cy="60" rx="5" ry="2" fill="#dfae94" />
      <path
        d="M57 65Q60 68 63 65"
        fill="none"
        stroke="#ba8d75"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {archetype === "mage" && (
        <>
          <path d="M40 29L57 0L78 29Z" fill={color} />
          <ellipse cx="60" cy="30" rx="36" ry="7" fill="#937caf" />
          <path
            d="M59 13L61 18L67 20L62 23L60 28L57 22L52 20L57 18Z"
            fill="#e5cf94"
          />
        </>
      )}
      {archetype === "healer" && (
        <>
          <path d="M36 31Q60 12 84 31L83 37L36 37Z" fill="#efe9d6" />
          <path d="M58 26H62V30H66V34H62V38H58V34H54V30H58Z" fill="#8ea699" />
        </>
      )}
      {archetype === "archer" && (
        <path
          d="M96 69Q117 89 96 109M96 69V109"
          fill="none"
          stroke="#97734f"
          strokeWidth="3"
        />
      )}
      {(archetype === "mage" || archetype === "healer") && (
        <>
          <path d="M94 72V111" stroke="#a98765" strokeWidth="4" />
          <circle
            cx="94"
            cy="70"
            r="6"
            fill={archetype === "mage" ? "#c0acd9" : "#afc8bb"}
          />
        </>
      )}
      {(archetype === "warrior" || archetype === "swordsman") && (
        <>
          <path d="M28 84L24 108" stroke="#93938c" strokeWidth="5" />
          <path d="M20 84L34 87" stroke="#d2b87a" strokeWidth="4" />
        </>
      )}
    </svg>
  );
}
