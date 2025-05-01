/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.DTOs.Boards
{
    
    /// Data transfer object for a task board
    
    public class BoardDTO
    {
        
        /// Unique identifier for the board
        
        public int Id { get; set; }

        
        /// Name of the board
        
        public string Name { get; set; } = string.Empty;

        
        /// Description of the board
        
        public string? Description { get; set; }

        
        /// User ID who owns the board
        
        public int UserId { get; set; }

        
        /// Board columns (statuses)
        
        public List<BoardColumnDTO> Columns { get; set; } = new List<BoardColumnDTO>();

        
        /// Date when the board was created
        
        public DateTime CreatedAt { get; set; }

        
        /// Date when the board was last updated
        
        public DateTime? UpdatedAt { get; set; }
        
        /// Total number of tasks on the board
        public int TaskCount { get; set; }
    }

    
    /// Data transfer object for a board column
    
    public class BoardColumnDTO
    {
        
        /// Unique identifier for the column
        
        public int Id { get; set; }

        
        /// Name of the column
        
        public string Name { get; set; } = string.Empty;

        
        /// Order of the column
        
        public int Order { get; set; }

        
        /// Color of the column
        
        public string? Color { get; set; }

        
        /// Column type/status
        
        public TaskItemStatus Status { get; set; }
    }

    
    /// Data transfer object for detailed board information including tasks
    
    public class BoardDetailDTO
    {
        
        /// The board details
        
        public BoardDTO Board { get; set; } = new BoardDTO();

        
        /// Tasks organized by column
        
        public Dictionary<string, List<TaskItemResponseDTO>> TasksByColumn { get; set; } = new Dictionary<string, List<TaskItemResponseDTO>>();
        
        /// Tasks in the board
        public IEnumerable<TaskItemDTO> Tasks { get; set; } = new List<TaskItemDTO>();
        
        /// Total number of tasks on the board
        public int TaskCount { get; set; }
    }

    
    /// Data transfer object for creating a new board
    
    public class CreateBoardDTO
    {
        
        /// Name of the board
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the board
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// Optional initial columns for the board
        
        public List<BoardColumnCreateDTO>? Columns { get; set; }
    }

    
    /// Data transfer object for creating a board column
    
    public class BoardColumnCreateDTO
    {
        
        /// Name of the column
        
        [Required]
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Order of the column
        
        public int Order { get; set; }

        
        /// Color of the column
        
        [StringLength(20, ErrorMessage = "Color cannot exceed 20 characters")]
        public string? Color { get; set; }

        
        /// Column type/status
        
        public TaskItemStatus Status { get; set; }
    }

    
    /// Data transfer object for updating a board
    
    public class UpdateBoardDTO
    {
        
        /// Name of the board
        
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string? Name { get; set; }

        
        /// Description of the board
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// Columns to update or add
        
        public List<BoardColumnUpdateDTO>? Columns { get; set; }
    }

    
    /// Data transfer object for updating a board column
    
    public class BoardColumnUpdateDTO
    {
        
        /// Identifier for the column (null for new columns)
        
        public int? Id { get; set; }

        
        /// Name of the column
        
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string? Name { get; set; }

        
        /// Order of the column
        
        public int? Order { get; set; }

        
        /// Color of the column
        
        [StringLength(20, ErrorMessage = "Color cannot exceed 20 characters")]
        public string? Color { get; set; }

        
        /// Column type/status
        
        public TaskItemStatus? Status { get; set; }
    }

    
    /// DTO for reordering tasks within a board
    
    public class TaskReorderDTO
    {
        
        /// Task ID to be reordered
        
        [Required]
        public int TaskId { get; set; }

        
        /// Source column/status
        
        [Required]
        public TaskItemStatus SourceStatus { get; set; }

        
        /// Target column/status
        
        [Required]
        public TaskItemStatus TargetStatus { get; set; }

        
        /// Position in the target column (0-based)
        
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Position must be non-negative")]
        public int TargetPosition { get; set; }
    }
} 