import type { ParsedInterface } from "./astParser";

export function visualizeAST(
  interfaces: ParsedInterface[],
  container: HTMLElement
) {
  container.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.style.background = "#f9fafb";

  interfaces.forEach((interface_, index) => {
    const x = 50 + index * 300;
    const y = 50;

    // 绘制接口框
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", y.toString());
    rect.setAttribute("width", "250");
    rect.setAttribute(
      "height",
      (60 + interface_.properties.length * 25).toString()
    );
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#e5e7eb");
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("rx", "8");
    svg.appendChild(rect);

    // 接口名称
    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    title.setAttribute("x", (x + 125).toString());
    title.setAttribute("y", (y + 25).toString());
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-weight", "bold");
    title.setAttribute("font-size", "16");
    title.setAttribute("fill", "#1f2937");
    title.textContent = interface_.name;
    svg.appendChild(title);

    // 分割线
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", (x + 10).toString());
    line.setAttribute("y1", (y + 35).toString());
    line.setAttribute("x2", (x + 240).toString());
    line.setAttribute("y2", (y + 35).toString());
    line.setAttribute("stroke", "#e5e7eb");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);

    // 属性列表
    interface_.properties.forEach((property, propIndex) => {
      const propY = y + 55 + propIndex * 25;

      const propText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      propText.setAttribute("x", (x + 15).toString());
      propText.setAttribute("y", propY.toString());
      propText.setAttribute("font-size", "12");
      propText.setAttribute("fill", "#374151");

      const optionalMark = property.optional ? "?" : "";
      propText.textContent = `${property.name}${optionalMark}: ${property.type}`;
      svg.appendChild(propText);

      // 类型颜色标识
      const typeColor = getTypeColor(property.type);
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", (x + 230).toString());
      circle.setAttribute("cy", (propY - 4).toString());
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", typeColor);
      svg.appendChild(circle);
    });
  });

  container.appendChild(svg);
}

function getTypeColor(type: string): string {
  const colors = {
    string: "#10b981",
    number: "#3b82f6",
    boolean: "#f59e0b",
    Date: "#8b5cf6",
    default: "#6b7280",
  };
  return colors[type as keyof typeof colors] || colors.default;
}
