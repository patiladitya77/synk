// const { render } = require("@testing-library/react");
import { render, screen } from "@testing-library/react";
import CreateCanvasCard from "../CreateCanvasCard";
describe("", () => {
  it("should render text", () => {
    const mockOnClick = jest.fn();
    render(<CreateCanvasCard onClick={mockOnClick} />);
    const heading = screen.getByText("Create a blank canvas");
    expect(heading).toBeInTheDocument();
  });
});
