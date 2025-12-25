/**
 * PathChoiceDialog Component
 * Displays a dialog with category options for the user to choose
 * Now with pagination to browse through all categories
 * Categories are shown even if fully mastered, but disabled
 */

import { useState, useEffect } from 'react';
import { getAllCategoryIds } from '../config/questions';
import { isCategoryFullyMastered, getCategoryCorrectAnswerCount, getCategoryQuestionCount } from '../utils/questionTracking';
import { FLASH_CARDS_ENABLED } from '../config/flashCardsConfig';

const PathChoiceDialog = ({ forkCategories, getCategoryById, onPathChoice, onOpenShop, onOpenFlashCards, currentCategory = null, correctAnswersByCategory = {}, completedCategories = new Set() }) => {
  const [dialogTop, setDialogTop] = useState('100px');
  
  // Load saved page from localStorage or default to 0
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedPage = localStorage.getItem('categoryGridPage');
      return savedPage ? parseInt(savedPage, 10) : 0;
    } catch (error) {
      console.error('Error loading saved category page:', error);
      return 0;
    }
  });
  
  // Get all categories - we now show all of them, just disable the mastered ones
  const allCategoryIds = getAllCategoryIds();
  const categoriesToShow = allCategoryIds;
  
  const categoriesPerPage = 4;
  const totalPages = Math.ceil(categoriesToShow.length / categoriesPerPage);
  
  // Get current page categories
  const startIndex = currentPage * categoriesPerPage;
  const endIndex = startIndex + categoriesPerPage;
  const currentPageCategories = categoriesToShow.slice(startIndex, endIndex);
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => {
      const newPage = (prev - 1 + totalPages) % totalPages;
      localStorage.setItem('categoryGridPage', newPage.toString());
      return newPage;
    });
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => {
      const newPage = (prev + 1) % totalPages;
      localStorage.setItem('categoryGridPage', newPage.toString());
      return newPage;
    });
  };

  useEffect(() => {
    const calculatePosition = () => {
      // Look for the logo image by its alt text
      const logoImg = document.querySelector('img[alt="WordWalk Logo"]');
      if (logoImg) {
        // Get the parent container of the logo
        const logoContainer = logoImg.parentElement;
        if (logoContainer) {
          const rect = logoContainer.getBoundingClientRect();
          // Position 10px below the logo, accounting for viewport scrolling
          const topPosition = rect.bottom + 10 + window.scrollY;
          setDialogTop(`${topPosition}px`);
        }
      }
    };

    // Calculate on mount
    calculatePosition();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    
    // Also recalculate on scroll since absolute/fixed positioning can be affected
    window.addEventListener('scroll', calculatePosition);
    
    // Use a small delay to ensure everything is rendered
    const timer = setTimeout(calculatePosition, 150);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      clearTimeout(timer);
    };
  }, []);
  // Validate forkCategories structure
  if (!forkCategories || typeof forkCategories !== 'object') {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
        zIndex: 1010,
        minWidth: '280px',
        maxWidth: 'min(85vw, 380px)',
        display: 'flex',
        flexDirection: 'column',
        color: 'red',
        fontFamily: 'monospace',
      }}>
        <h3>Error: Categories Missing</h3>
        <pre style={{ margin: 0, fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify({ forkCategories }, null, 2)}
        </pre>
      </div>
    );
  }

  const createButton = (categoryId) => {
    const category = getCategoryById(categoryId);
    
    if (!category) {
      return (
        <div key={categoryId} style={{
          padding: '15px 20px',
          fontSize: '14px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #c62828',
          borderRadius: '10px',
          minWidth: '140px',
          textAlign: 'center',
        }}>
          Missing: {categoryId}
        </div>
      );
    }
    
    // Check if this category is fully mastered (all questions answered correctly on first try)
    const isFullyMastered = isCategoryFullyMastered(categoryId, correctAnswersByCategory);
    // Check if this category was just completed in this session
    const isJustCompleted = completedCategories.has(categoryId);
    const isCurrentCategory = categoryId === currentCategory;
    // Only disable if fully mastered - allow users to continue with current or just-completed categories
    const isDisabled = isFullyMastered;
    
    // Get mastered and total question counts for this category
    const masteredCount = getCategoryCorrectAnswerCount(categoryId, correctAnswersByCategory);
    const totalCount = getCategoryQuestionCount(categoryId);
    
    // Determine the title message
    let titleMessage = '';
    if (isFullyMastered) {
      titleMessage = 'Category Mastered! ✨ All questions answered correctly';
    } else if (isCurrentCategory) {
      titleMessage = 'Continue with this category';
    } else if (isJustCompleted) {
      titleMessage = 'Category Completed! 🎉 Select to continue practicing';
    }
    
    return (
      <button
        key={categoryId}
        onClick={() => !isDisabled && onPathChoice(categoryId)}
        disabled={isDisabled}
        title={titleMessage}
        style={{
          padding: '10px 15px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: isDisabled ? '#9e9e9e' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled ? '0 2px 3px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          minWidth: '140px',
          opacity: isDisabled ? 0.6 : 1,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.backgroundColor = '#45a049';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.target.style.transform = 'scale(1)';
            e.target.style.backgroundColor = '#4CAF50';
          }
        }}
      >
        <span style={{ fontSize: '32px' }}>{category.emoji}</span>
        <span style={{ fontSize: '14px', textAlign: 'center' }}>{category.displayName}</span>
        <span style={{ 
          fontSize: '11px', 
          textAlign: 'center',
          opacity: 0.9,
          marginTop: '2px'
        }}>
          {masteredCount}/{totalCount}
        </span>
        {isFullyMastered && (
          <span style={{ fontSize: '16px', position: 'absolute', top: '5px', right: '5px' }}>✨</span>
        )}
        {isJustCompleted && !isFullyMastered && (
          <span style={{ fontSize: '16px', position: 'absolute', top: '5px', right: '5px' }}>🎉</span>
        )}
      </button>
    );
  };

  return (
    <div id="path-choice-dialog" style={{
      position: 'fixed',
      top: dialogTop,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      zIndex: 1010,
      minWidth: '280px',
      maxWidth: 'min(85vw, 380px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        textAlign: 'center',
        fontSize: '22px',
        color: '#333',
      }}>
        Choose Your Path 🛤️
      </h3>
      
      {/* Pagination Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {/* Previous Button */}
        <button
          onClick={handlePrevPage}
          disabled={totalPages <= 1}
          style={{
            padding: '8px 12px',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: totalPages <= 1 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
            boxShadow: totalPages <= 1 ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            opacity: totalPages <= 1 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (totalPages > 1) {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = '#1976D2';
            }
          }}
          onMouseLeave={(e) => {
            if (totalPages > 1) {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = '#2196F3';
            }
          }}
        >
          ❮
        </button>
        
        {/* Categories Grid */}
        <div id="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          flex: 1,
        }}>
          {currentPageCategories.map(categoryId => createButton(categoryId))}
        </div>
        
        {/* Next Button */}
        <button
          onClick={handleNextPage}
          disabled={totalPages <= 1}
          style={{
            padding: '8px 12px',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: totalPages <= 1 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
            boxShadow: totalPages <= 1 ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            opacity: totalPages <= 1 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (totalPages > 1) {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = '#1976D2';
            }
          }}
          onMouseLeave={(e) => {
            if (totalPages > 1) {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = '#2196F3';
            }
          }}
        >
          ❯
        </button>
      </div>
      
      {/* Page Indicator */}
      {totalPages > 1 && (
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          marginBottom: '8px',
        }}>
          Page {currentPage + 1} of {totalPages}
        </div>
      )}

      {/* Debug and Vendor Section */}
      <div id="debug-flash-cards-button" style={{
        display: 'flex',
        gap: '10px',
        marginTop: '6px',
        borderTop: '2px solid #ddd',
        paddingTop: '10px',
      }}>
        {/* Debug Flash Cards Button */}
        {FLASH_CARDS_ENABLED && onOpenFlashCards && (
          <button
            onClick={onOpenFlashCards}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.backgroundColor = '#7B1FA2';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = '#9C27B0';
            }}
          >
            <span style={{ fontSize: '20px' }}>🎴</span>
            <span>Flash Cards</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>(Debug)</span>
          </button>
        )}

        {/* Vendor Section */}
        <div id = "vendor-section" style={{
          position: 'relative',
          flex: 1,
        }}>
          <img 
            src={`${import.meta.env.BASE_URL || '/'}images/vendor.png`}
            alt="Vendor"
            style={{
              width: '30%',
              height: 'auto',
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <button
            onClick={onOpenShop}
            style={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateX(-50%) scale(1.1)';
              e.target.style.backgroundColor = '#FB8C00';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateX(-50%) scale(1)';
              e.target.style.backgroundColor = '#FF9800';
            }}
          >
            💰 TRADE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathChoiceDialog;
