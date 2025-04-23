import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import type { PaginationDto } from "../types";
import type { MouseEvent } from "react";

interface PaginationControlsProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  const { page, total_pages } = pagination;

  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (total_pages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to maxVisiblePages
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of the middle section
      let start = Math.max(2, page - 1);
      let end = Math.min(total_pages - 1, page + 1);

      // Adjust if we're near the start
      if (page <= 3) {
        end = 4;
      }
      // Adjust if we're near the end
      if (page >= total_pages - 2) {
        start = total_pages - 3;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < total_pages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Always show last page
      pages.push(total_pages);
    }

    return pages;
  };

  if (total_pages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNum, idx) =>
          pageNum === -1 ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (page < total_pages) onPageChange(page + 1);
            }}
            className={page >= total_pages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
