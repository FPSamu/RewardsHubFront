import { useState } from 'react'
import {
    Avatar,
    AvatarGroup,
    Chip,
    Button,
    IconButton,
    Card,
    Switch,
    ProgressDonut,
    Badge,
} from '../components/DesignSystemComponents'

// Mock Icons (using Unicode symbols)
const Icons = {
    ellipsis: '⋯',
    chevronLeft: '‹',
    chevronRight: '›',
    check: '✓',
    close: '✕',
    plus: '+',
    settings: '⚙',
    bell: '🔔',
    menu: '☰',
}

const DesignSystemShowcase = () => {
    const [switchStates, setSwitchStates] = useState({
        integration1: true,
        integration2: false,
        integration3: true,
    })

    const mockAvatars = [
        { src: '', fallback: 'JD' },
        { src: '', fallback: 'SM' },
        { src: '', fallback: 'AL' },
        { src: '', fallback: 'RK' },
        { src: '', fallback: 'MJ' },
        { src: '', fallback: 'TC' },
    ]

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        <span className="text-brand-primary">RewardsHub</span> Design System
                    </h1>
                    <p className="text-lg text-gray-600">Component showcase & style guide</p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Profile Card */}
                    <Card>
                        <div className="flex items-start justify-between mb-4">
                            <Avatar size="lg" fallback="JS" />
                            <IconButton icon={Icons.ellipsis} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">Jessica Smith</h2>
                        <p className="text-sm text-gray-600 mb-4">Senior Product Designer</p>
                        <div className="flex flex-wrap gap-2">
                            <Chip label="UI/UX Design" variant="primary" />
                            <Chip label="Project management" variant="neutral" />
                            <Chip label="Agile methodologies" variant="neutral" />
                        </div>
                    </Card>

                    {/* Buttons & Controls */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buttons & Controls</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Button variant="primary" size="md">Primary Button</Button>
                                <Button variant="gold" size="md">Gold Accent</Button>
                                <Button variant="success" size="md">Success Button</Button>
                                <Button variant="secondary" size="md">Secondary Button</Button>
                                <Button variant="ghost" size="md">Ghost Button</Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" size="sm">Small</Button>
                                <Button variant="secondary" size="sm" icon={Icons.plus} iconPosition="start">
                                    Add Item
                                </Button>
                                <IconButton icon={Icons.settings} />
                                <IconButton icon={Icons.bell} />
                            </div>
                        </div>
                    </Card>

                    {/* Avatars */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Avatars</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Sizes</p>
                                <div className="flex items-center gap-3">
                                    <Avatar size="xs" fallback="XS" />
                                    <Avatar size="sm" fallback="SM" />
                                    <Avatar size="md" fallback="MD" />
                                    <Avatar size="lg" fallback="LG" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Avatar Group</p>
                                <AvatarGroup avatars={mockAvatars} maxVisible={4} />
                            </div>
                        </div>
                    </Card>

                    {/* Calendar */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">November 2025</h3>
                            <div className="flex gap-1">
                                <IconButton icon={Icons.chevronLeft} />
                                <IconButton icon={Icons.chevronRight} />
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                                <div key={day} className="text-xs font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => (
                                <button
                                    key={date}
                                    className={`h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors
                    ${date === 15
                                            ? 'bg-brand-primary text-white'
                                            : date === new Date().getDate()
                                                ? 'ring-2 ring-brand-primary text-gray-900'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {date}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Project Summary */}
                    <Card>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Mobile App Redesign</h3>
                                <p className="text-sm text-gray-500">Q4 2025 Initiative</p>
                            </div>
                            <IconButton icon={Icons.menu} />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <AvatarGroup avatars={mockAvatars.slice(0, 3)} maxVisible={3} />
                            <ProgressDonut progress={68} label />
                        </div>
                        <Button variant="secondary" size="sm" className="w-full">
                            View details
                        </Button>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <Badge>3</Badge>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Avatar size="sm" fallback="AM" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Anna Martinez</p>
                                    <p className="text-xs text-gray-500">wants to join your project</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-brand-primary rounded-full"></span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="success" size="sm">Accept</Button>
                                <Button variant="secondary" size="sm">Deny</Button>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-start gap-3">
                                    <Avatar size="sm" fallback="LK" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Lucas Kim</p>
                                        <p className="text-xs text-gray-500">mentioned you in a comment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Integrations */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                                        SL
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Slack</p>
                                        <p className="text-xs text-gray-500">Team communication</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={switchStates.integration1}
                                    onChange={(val) => setSwitchStates({ ...switchStates, integration1: val })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-accent-info flex items-center justify-center text-white text-xs font-bold">
                                        GH
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">GitHub</p>
                                        <p className="text-xs text-gray-500">Code repository</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={switchStates.integration2}
                                    onChange={(val) => setSwitchStates({ ...switchStates, integration2: val })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-accent-warning flex items-center justify-center text-white text-xs font-bold">
                                        FG
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Figma</p>
                                        <p className="text-xs text-gray-500">Design collaboration</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={switchStates.integration3}
                                    onChange={(val) => setSwitchStates({ ...switchStates, integration3: val })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Progress & Milestones */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900">Design Phase</p>
                                    <ProgressDonut progress={100} size={40} strokeWidth={5} />
                                </div>
                                <p className="text-xs text-gray-500">Completed Nov 10</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900">Development</p>
                                    <ProgressDonut progress={45} size={40} strokeWidth={5} />
                                </div>
                                <p className="text-xs text-gray-500">Due Nov 30</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900">Testing</p>
                                    <ProgressDonut progress={0} size={40} strokeWidth={5} />
                                </div>
                                <p className="text-xs text-gray-500">Starting Dec 1</p>
                            </div>
                        </div>
                    </Card>

                    {/* Chips & Tags */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chips & Tags</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Primary & Gold Variants</p>
                                <div className="flex flex-wrap gap-2">
                                    <Chip label="Featured" variant="primary" />
                                    <Chip label="⭐ Gold" variant="gold" />
                                    <Chip label="Important" variant="primary" />
                                    <Chip label="⭐ Premium" variant="gold" />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Neutral Variant</p>
                                <div className="flex flex-wrap gap-2">
                                    <Chip label="Design" variant="neutral" />
                                    <Chip label="Frontend" variant="neutral" />
                                    <Chip label="Backend" variant="neutral" />
                                    <Chip label="Mobile" variant="neutral" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Badges */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Badges</h3>
                        <div className="flex flex-wrap gap-3">
                            <div className="h-9 px-3 rounded-xl bg-white shadow-card border border-gray-200 flex items-center justify-center">
                                <span className="text-sm font-semibold text-brand-primary">REWARDS</span>
                            </div>
                            <div className="h-9 px-3 rounded-xl bg-white shadow-card border border-gray-200 flex items-center justify-center">
                                <span className="text-sm font-semibold text-accent-gold">⭐ GOLD</span>
                            </div>
                            <div className="h-9 px-3 rounded-xl bg-white shadow-card border border-gray-200 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-500">PARTNER</span>
                            </div>
                            <div className="h-9 px-3 rounded-xl bg-white shadow-card border border-gray-200 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-700">BUSINESS</span>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    )
}

export default DesignSystemShowcase
