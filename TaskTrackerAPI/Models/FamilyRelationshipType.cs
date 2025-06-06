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

namespace TaskTrackerAPI.Models;

/// <summary>
/// Defines the types of family relationships available in the system.
/// Used for display purposes and smart role recommendations in family management.
/// </summary>
public enum FamilyRelationshipType
{
    /// <summary>
    /// Other or unspecified relationship
    /// </summary>
    [Description("Other")]
    Other = 0,

    // === CORE FAMILY ===
    /// <summary>
    /// Parent relationship
    /// </summary>
    [Description("Parent")]
    Parent = 1,

    /// <summary>
    /// Child relationship
    /// </summary>
    [Description("Child")]
    Child = 2,

    /// <summary>
    /// Spouse relationship
    /// </summary>
    [Description("Spouse")]
    Spouse = 3,

    /// <summary>
    /// Partner relationship (non-married)
    /// </summary>
    [Description("Partner")]
    Partner = 4,

    /// <summary>
    /// Sibling relationship
    /// </summary>
    [Description("Sibling")]
    Sibling = 5,

    // === EXTENDED FAMILY ===
    /// <summary>
    /// Grandparent relationship
    /// </summary>
    [Description("Grandparent")]
    Grandparent = 6,

    /// <summary>
    /// Grandchild relationship
    /// </summary>
    [Description("Grandchild")]
    Grandchild = 7,

    /// <summary>
    /// Aunt relationship
    /// </summary>
    [Description("Aunt")]
    Aunt = 8,

    /// <summary>
    /// Uncle relationship
    /// </summary>
    [Description("Uncle")]
    Uncle = 9,

    /// <summary>
    /// Cousin relationship
    /// </summary>
    [Description("Cousin")]
    Cousin = 10,

    /// <summary>
    /// Nephew relationship
    /// </summary>
    [Description("Nephew")]
    Nephew = 11,

    /// <summary>
    /// Niece relationship
    /// </summary>
    [Description("Niece")]
    Niece = 12,

    // === STEP/BLENDED FAMILY ===
    /// <summary>
    /// Stepparent relationship
    /// </summary>
    [Description("Stepparent")]
    Stepparent = 13,

    /// <summary>
    /// Stepchild relationship
    /// </summary>
    [Description("Stepchild")]
    Stepchild = 14,

    /// <summary>
    /// Stepsister relationship
    /// </summary>
    [Description("Stepsister")]
    Stepsister = 15,

    /// <summary>
    /// Stepbrother relationship
    /// </summary>
    [Description("Stepbrother")]
    Stepbrother = 16,

    /// <summary>
    /// Half-sister relationship
    /// </summary>
    [Description("Half-sister")]
    HalfSister = 17,

    /// <summary>
    /// Half-brother relationship
    /// </summary>
    [Description("Half-brother")]
    HalfBrother = 18,

    // === IN-LAWS ===
    /// <summary>
    /// Mother-in-law relationship
    /// </summary>
    [Description("Mother-in-law")]
    MotherInLaw = 19,

    /// <summary>
    /// Father-in-law relationship
    /// </summary>
    [Description("Father-in-law")]
    FatherInLaw = 20,

    /// <summary>
    /// Sister-in-law relationship
    /// </summary>
    [Description("Sister-in-law")]
    SisterInLaw = 21,

    /// <summary>
    /// Brother-in-law relationship
    /// </summary>
    [Description("Brother-in-law")]
    BrotherInLaw = 22,

    /// <summary>
    /// Daughter-in-law relationship
    /// </summary>
    [Description("Daughter-in-law")]
    DaughterInLaw = 23,

    /// <summary>
    /// Son-in-law relationship
    /// </summary>
    [Description("Son-in-law")]
    SonInLaw = 24,

    // === CAREGIVERS & GUARDIANS ===
    /// <summary>
    /// Legal guardian relationship
    /// </summary>
    [Description("Guardian")]
    Guardian = 25,

    /// <summary>
    /// Caregiver relationship
    /// </summary>
    [Description("Caregiver")]
    Caregiver = 26,

    /// <summary>
    /// Foster parent relationship
    /// </summary>
    [Description("Foster Parent")]
    FosterParent = 27,

    /// <summary>
    /// Foster child relationship
    /// </summary>
    [Description("Foster Child")]
    FosterChild = 28,

    // === EXTENDED RELATIONSHIPS ===
    /// <summary>
    /// Family friend relationship
    /// </summary>
    [Description("Family Friend")]
    FamilyFriend = 29,

    /// <summary>
    /// Godparent relationship
    /// </summary>
    [Description("Godparent")]
    Godparent = 30,

    /// <summary>
    /// Godchild relationship
    /// </summary>
    [Description("Godchild")]
    Godchild = 31,

    /// <summary>
    /// Self reference (for admin/creator)
    /// </summary>
    [Description("Self")]
    Self = 32
} 