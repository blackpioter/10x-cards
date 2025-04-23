import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationDto } from "../types";

interface PaginationControlsProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  const { page, total_pages } = pagination;

  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (total_pages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      return Array.from({ length: total_pages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate start and end of the middle section
    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(total_pages - 1, page + 1);

    // Adjust if we're near the start
    if (page <= 3) {
      endPage = 4;
    }

    // Adjust if we're near the end
    if (page >= total_pages - 2) {
      startPage = total_pages - 3;
    }

    // Add ellipsis if there's a gap after page 1
    if (startPage > 2) {
      pages.push("ellipsis");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis if there's a gap before the last page
    if (endPage < total_pages - 1) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (total_pages > 1) {
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
          <PaginationPrevious onClick={() => onPageChange(page - 1)} disabled={page === 1} />
        </PaginationItem>

        {getPageNumbers().map((pageNum, index) =>
          pageNum === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink isActive={pageNum === page} onClick={() => onPageChange(pageNum)} size="default">
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(page + 1)} disabled={page === total_pages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
