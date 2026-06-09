"use strict";
/**
 * Kun Khmer Management System - Domain Validation Rules
 *
 * Implements core domain checks for Fighters, Bout Results, and Weight Agreements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPROVED_GLOVE_BRANDS = void 0;
exports.validateFighter = validateFighter;
exports.validateMatch = validateMatch;
exports.validateBoutResult = validateBoutResult;
// Approved glove brands by the Kun Khmer Federation (KKF)
exports.APPROVED_GLOVE_BRANDS = [
    'Twins Special BGVL-3',
    'Fairtex BGV1',
    'Top King Super Air',
    'Boon Retro',
    'Yokkao Matrix',
    'Raja Boxing RBG-1',
    'Windy BGVH',
    'Venum Elite'
];
/**
 * Validates Fighter registration constraints
 */
function validateFighter(fighter) {
    if (!fighter.name || fighter.name.trim() === '') {
        return { success: false, error: 'Fighter English name is required' };
    }
    if (!fighter.nameKhmer || fighter.nameKhmer.trim() === '') {
        return { success: false, error: 'Fighter Khmer name is required' };
    }
    // Verify date of birth and minimum age of 15
    const dob = new Date(fighter.dateOfBirth);
    if (isNaN(dob.getTime())) {
        return { success: false, error: 'Invalid Date of Birth' };
    }
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 15) {
        return { success: false, error: 'Fighter must be at least 15 years old to register' };
    }
    if (fighter.currentWeight < 30 || fighter.currentWeight > 150) {
        return { success: false, error: 'Fighter weight must be between 30kg and 150kg' };
    }
    return { success: true };
}
/**
 * Validates Match constraints, including Agreed Weight Tolerances and Glove agreements.
 */
function validateMatch(match, fighterA, fighterB) {
    if (match.fighterAId !== fighterA.id || match.fighterBId !== fighterB.id) {
        return { success: false, error: 'Fighter profiles do not match fight card' };
    }
    // Kun Khmer Weight Agreement Tolerance check (±2kg max deviation)
    const weightDiffA = Math.abs(fighterA.currentWeight - match.agreedWeight);
    const weightDiffB = Math.abs(fighterB.currentWeight - match.agreedWeight);
    if (weightDiffA > 2.0) {
        return {
            success: false,
            error: `Fighter A weight mismatch: current weight (${fighterA.currentWeight}kg) deviates from agreed weight (${match.agreedWeight}kg) by more than 2kg`
        };
    }
    if (weightDiffB > 2.0) {
        return {
            success: false,
            error: `Fighter B weight mismatch: current weight (${fighterB.currentWeight}kg) deviates from agreed weight (${match.agreedWeight}kg) by more than 2kg`
        };
    }
    // Glove specifications check
    if (!['6oz', '8oz', '10oz'].includes(match.gloveSize)) {
        return { success: false, error: 'Glove size must be 6oz, 8oz, or 10oz' };
    }
    if (!exports.APPROVED_GLOVE_BRANDS.includes(match.gloveBrand)) {
        return { success: false, error: `Invalid glove brand. Must be one of: ${exports.APPROVED_GLOVE_BRANDS.join(', ')}` };
    }
    return { success: true };
}
/**
 * Validates Bout Results
 */
function validateBoutResult(result, maxRounds = 5) {
    if (result.round < 1 || result.round > maxRounds) {
        return { success: false, error: `Bout round must be between 1 and ${maxRounds}` };
    }
    const validMethods = ['KO', 'TKO', 'Decision', 'Submission', 'Draw', 'No Contest'];
    if (!validMethods.includes(result.method)) {
        return { success: false, error: 'Invalid bout outcome method' };
    }
    return { success: true };
}
