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
using System.Linq;

namespace TaskTrackerAPI.Models
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalCount { get; set; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
        
        public PagedResult() { }
        
        public PagedResult(List<T> items, int count, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = count;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        }
        
        public static PagedResult<T> Create(IEnumerable<T> source, int pageNumber, int pageSize)
        {
            int count = 0;
            List<T> items = new List<T>();
            
            if (source != null)
            {
                count = source.Count();
                items = source.Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
            }
            
            return new PagedResult<T>(items, count, pageNumber, pageSize);
        }
    }
} 