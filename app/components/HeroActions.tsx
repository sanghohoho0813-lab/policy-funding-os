"use client";

function scrollToDiagnosis() {
  document
    .getElementById("diagnosis")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function StartButton({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={scrollToDiagnosis} className={className}>
      {children}
    </button>
  );
}

export function SampleButton({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    scrollToDiagnosis();
    window.dispatchEvent(new CustomEvent("pfos:sample"));
  };
  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
