export const LOADER_CONFIG = {
  containerStyles: {
    background: "#071326", // Fond principal de la charte
  },
  innerStyles: {
    backgroundColor: "#050B14", // Ombres profondes
    width: "300px",
    height: "2px",
    borderRadius: "2px",
  },
  barStyles: {
    backgroundColor: "#D8AF3A", // Accent or vif
    height: "2px",
    borderRadius: "2px",
  },
  dataInterpolation: (p: number) => `Préparation du navire... ${Math.round(p)}%`,
  initialState: (active: boolean) => active,
  dataStyles: {
    color: "#F0C674", // Or doux
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    fontWeight: "300",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginTop: "20px",
  },
};
