import React from 'react';
import {
  HStack,
  IconButton,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  size = 'sm'
}: PaginationProps) {
  // Se não há páginas ou apenas uma página, não mostra a paginação
  if (totalPages <= 1) {
    return null;
  }

  // Calcular itens mostrados na página atual
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gerar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com ellipsis
      if (currentPage <= 3) {
        // Páginas iniciais
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Páginas finais
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Páginas do meio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <VStack spacing={2} mt={4}>
      {showInfo && (
        <Text fontSize="sm" color="gray.500">
          Página {currentPage} de {totalPages} • {totalItems} item(ns) total
        </Text>
      )}
      
      <HStack spacing={1} justify="center">
        <IconButton
          aria-label="Página anterior"
          icon={<ChevronLeft />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          size={size}
          variant="ghost"
        />
        
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <Text key={`ellipsis-${index}`} px={2} color="gray.500">
                ...
              </Text>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              size={size}
              variant={isCurrentPage ? "solid" : "ghost"}
              colorScheme={isCurrentPage ? "blue" : undefined}
              onClick={() => onPageChange(pageNumber)}
              minW="40px"
              aria-label={`Ir para página ${pageNumber}`}
            >
              {pageNumber}
            </Button>
          );
        })}
        
        <IconButton
          aria-label="Próxima página"
          icon={<ChevronRight />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
          size={size}
          variant="ghost"
        />
      </HStack>
    </VStack>
  );
}
