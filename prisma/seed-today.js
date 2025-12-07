"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prismaClient_1 = require("../lib/prismaClient");
var bcryptjs_1 = require("bcryptjs");
// Sample data for today's entries
var TODAY = new Date();
// Helper function to set time to start of today
function startOfToday() {
    var today = new Date(TODAY);
    today.setHours(0, 0, 0, 0);
    return today;
}
// Sample focus entries for today
var TODAYS_FOCUS_ENTRIES = [
    {
        title: 'Complete project presentation',
        status: 'PENDING',
        mood: 'Energetic',
        notes: 'Need to finalize the slides and practice the demo',
        image: null
    },
    {
        title: 'Team sync meeting',
        status: 'ACHIEVED',
        mood: 'Focused',
        notes: 'Discuss progress and blockers with the team',
        image: null
    },
    {
        title: 'Code review',
        status: 'PENDING',
        mood: 'Determined',
        notes: 'Review PRs and provide feedback',
        image: null
    }
];
// Sample decision entries for today
var TODAYS_DECISION_ENTRIES = [
    {
        title: 'Choose tech stack for new project',
        reason: 'Need to decide between Next.js and Remix for the frontend',
        status: 'PENDING',
        category: 'CAREER',
        image: null
    },
    {
        title: 'Plan team building activity',
        reason: 'Boost team morale and collaboration',
        status: 'PENDING',
        category: 'RELATIONSHIPS',
        image: null
    }
];
function createTestUser() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, bcryptjs_1.hash)('password123', 12)];
                case 1:
                    hashedPassword = _a.sent();
                    return [2 /*return*/, prismaClient_1.default.user.upsert({
                            where: { email: 'test@example.com' },
                            update: {},
                            create: {
                                email: 'test@example.com',
                                name: 'Test User',
                                password: hashedPassword,
                                bio: 'A test user for development',
                                theme: 'LIGHT',
                            },
                        })];
            }
        });
    });
}
function getTestUser() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, prismaClient_1.default.user.findUnique({
                    where: { email: 'faisal@demo.com' },
                })];
        });
    });
}
function createTodaysEntries() {
    return __awaiter(this, void 0, void 0, function () {
        var user, focusPromises, decisionPromises, _a, focusEntries, decisionEntries;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Seeding database with today\'s entries...');
                    return [4 /*yield*/, getTestUser()];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        console.log('❌ Test user not found');
                        return [2 /*return*/];
                    }
                    console.log("\u2705 Created test user: ".concat(user.email));
                    focusPromises = TODAYS_FOCUS_ENTRIES.map(function (focus) {
                        return prismaClient_1.default.focus.create({
                            data: __assign(__assign({}, focus), { date: startOfToday(), userId: user.id }),
                        });
                    });
                    decisionPromises = TODAYS_DECISION_ENTRIES.map(function (decision) {
                        return prismaClient_1.default.decision.create({
                            data: __assign(__assign({}, decision), { date: startOfToday(), userId: user.id }),
                        });
                    });
                    return [4 /*yield*/, Promise.all([
                            Promise.all(focusPromises),
                            Promise.all(decisionPromises)
                        ])];
                case 2:
                    _a = _b.sent(), focusEntries = _a[0], decisionEntries = _a[1];
                    console.log("\u2705 Created ".concat(focusEntries.length, " focus entries"));
                    console.log("\u2705 Created ".concat(decisionEntries.length, " decision entries"));
                    return [2 /*return*/, { user: user, focusEntries: focusEntries, decisionEntries: decisionEntries }];
            }
        });
    });
}
createTodaysEntries()
    .then(function () {
    console.log('🌱 Seeding completed successfully!');
    process.exit(0);
})
    .catch(function (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
});
