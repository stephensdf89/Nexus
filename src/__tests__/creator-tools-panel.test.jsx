import { fireEvent, render, screen } from "@testing-library/react";
import CreatorToolsPanel from "@/components/CreatorToolsPanel";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("CreatorToolsPanel", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("routes Content Planner to /content", () => {
    render(<CreatorToolsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /content planner/i }));
    expect(mockPush).toHaveBeenCalledWith("/content");
  });

  it("routes Task Manager to /pipelines", () => {
    render(<CreatorToolsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /task manager/i }));
    expect(mockPush).toHaveBeenCalledWith("/pipelines");
  });

  it("routes Idea Inbox to /assistant", () => {
    render(<CreatorToolsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /idea inbox/i }));
    expect(mockPush).toHaveBeenCalledWith("/assistant");
  });

  it("routes Templates to /community", () => {
    render(<CreatorToolsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /templates/i }));
    expect(mockPush).toHaveBeenCalledWith("/community");
  });

  it("routes View All Tools to /content", () => {
    render(<CreatorToolsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /view all tools/i }));
    expect(mockPush).toHaveBeenCalledWith("/content");
  });
});