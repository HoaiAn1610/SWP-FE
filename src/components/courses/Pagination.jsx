import React from "react";
import { Pagination } from "react-bootstrap";

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1, // số trang hiển thị trước/sau current
}) => {
  const range = (from, to) => {
    const res = [];
    for (let i = from; i <= to; i++) res.push(i);
    return res;
  };

  // window xung quanh currentPage
  const start = Math.max(2, currentPage - siblingCount);
  const end   = Math.min(totalPages - 1, currentPage + siblingCount);
  const middlePages = range(start, end);

  return (
    <Pagination>
      {/* Prev */}
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      />

      {/* Trang 1 */}
      <Pagination.Item
        active={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        1
      </Pagination.Item>

      {/* Ellipsis trước */}
      {start > 2 && <Pagination.Ellipsis disabled />}

      {/* Các trang giữa */}
      {middlePages.map(page => (
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      ))}

      {/* Ellipsis sau */}
      {end < totalPages - 1 && <Pagination.Ellipsis disabled />}

      {/* Trang cuối */}
      {totalPages > 1 && (
        <Pagination.Item
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      )}

      {/* Next */}
      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
      />
    </Pagination>
  );
};

export default CustomPagination;
