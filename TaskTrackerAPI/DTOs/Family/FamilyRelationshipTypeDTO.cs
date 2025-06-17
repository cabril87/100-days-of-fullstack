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
using System.ComponentModel;

namespace TaskTrackerAPI.DTOs.Family
{
    /// <summary>
    /// Family relationship type enumeration for DTOs
    /// </summary>
    public enum FamilyRelationshipTypeDTO
    {
        [Description("Other")]
        Other = 0,
        [Description("Parent")]
        Parent = 1,
        [Description("Child")]
        Child = 2,
        [Description("Spouse")]
        Spouse = 3,
        [Description("Partner")]
        Partner = 4,
        [Description("Sibling")]
        Sibling = 5,
        [Description("Grandparent")]
        Grandparent = 6,
        [Description("Grandchild")]
        Grandchild = 7,
        [Description("Aunt")]
        Aunt = 8,
        [Description("Uncle")]
        Uncle = 9,
        [Description("Cousin")]
        Cousin = 10,
        [Description("Nephew")]
        Nephew = 11,
        [Description("Niece")]
        Niece = 12,
        [Description("Stepparent")]
        Stepparent = 13,
        [Description("Stepchild")]
        Stepchild = 14,
        [Description("Stepsister")]
        Stepsister = 15,
        [Description("Stepbrother")]
        Stepbrother = 16,
        [Description("Half-sister")]
        HalfSister = 17,
        [Description("Half-brother")]
        HalfBrother = 18,
        [Description("Mother-in-law")]
        MotherInLaw = 19,
        [Description("Father-in-law")]
        FatherInLaw = 20,
        [Description("Sister-in-law")]
        SisterInLaw = 21,
        [Description("Brother-in-law")]
        BrotherInLaw = 22,
        [Description("Daughter-in-law")]
        DaughterInLaw = 23,
        [Description("Son-in-law")]
        SonInLaw = 24,
        [Description("Guardian")]
        Guardian = 25,
        [Description("Caregiver")]
        Caregiver = 26,
        [Description("Foster Parent")]
        FosterParent = 27,
        [Description("Foster Child")]
        FosterChild = 28,
        [Description("Family Friend")]
        FamilyFriend = 29,
        [Description("Godparent")]
        Godparent = 30,
        [Description("Godchild")]
        Godchild = 31,
        [Description("Self")]
        Self = 32
    }
} 