/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
import React, { useState, useEffect, useMemo } from "react";

interface BasePaginationProps<T> {
  items: T[];
  page?: number;
  itemsPerPage?: number;
  filter?: (value: T, index: number, array: T[]) => boolean;
  onItemsChange?: (items: T[]) => void;
  children: (props: { items: T[] }) => React.ReactNode;
}

const BasePagination = <T,>({
  items,
  page = 1,
  itemsPerPage = 10,
  filter = () => true,
  onItemsChange,
  children,
}: BasePaginationProps<T>): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(page);

  const filteredItems = useMemo(() => items.filter(filter), [items, filter]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredItems.length / itemsPerPage),
    [filteredItems, itemsPerPage]
  );

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(currentItems);
    }
  }, [currentItems, onItemsChange]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredItems, totalPages, currentPage]);

  return (
    <div>
      {/* Render the current items using the children function */}
      {children({ items: currentItems })}

      {/* Pagination controls */}
      {filteredItems.length > itemsPerPage && (
        <div className="mt-4 flex w-full items-center justify-end gap-3 text-white">
          <button
            className="cursor-pointer rounded bg-blue-500"
            disabled={isFirstPage}
            onClick={() => changePage(currentPage - 1)}
          >
            <span className="px-2 font-bold text-white">{"<"}</span>
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <div
                key={page}
                className={`cursor-pointer text-lg ${
                  currentPage === page ? "text-coral font-black" : ""
                }`}
                onClick={() => changePage(page)}
              >
                {page}
              </div>
            )
          )}

          <button
            className="cursor-pointer rounded bg-blue-500"
            disabled={isLastPage}
            onClick={() => changePage(currentPage + 1)}
          >
            <span className="px-2 font-bold text-white">{">"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BasePagination;
