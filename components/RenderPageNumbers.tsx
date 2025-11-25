interface RenderPageNumbersProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPages(
  totalPages: number,
  currentPage: number,
  windowSize: number = 3
) {
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + windowSize - 1);

  //shift window left if we are at the end
  if (end - start + 1 <= windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }

  const pages: (number | string)[] = [];
  if (start > 1) {
    pages.push("...");
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (end < totalPages) {
    pages.push("...");
  }
  return pages;
}
const RenderPageNumbers = ({
  currentPage,
  totalPages,
  onPageChange,
}: RenderPageNumbersProps) => {
  const pages = buildPages(totalPages, currentPage);
  return pages.map((page, index) =>
    page === "..." ? (
      <span key={index}>...</span>
    ) : (
      <button
        key={index}
        onClick={() => onPageChange(page as number)}
        className={`px-3 py-2 rounded-md cursor-pointer ${
          page === currentPage
            ? "bg-primary text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }`}
      >
        {page}
      </button>
    )
  );
};

export default RenderPageNumbers;
