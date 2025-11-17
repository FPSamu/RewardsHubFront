// Avatar Component
export const Avatar = ({ src, alt, size = 'md', fallback }) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    }

    return (
        <div className={`${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span className="text-gray-700 font-medium">{fallback}</span>
            )}
        </div>
    )
}

// AvatarGroup Component
export const AvatarGroup = ({ avatars, maxVisible = 5 }) => {
    const visible = avatars.slice(0, maxVisible)
    const remaining = avatars.length - maxVisible

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((avatar, idx) => (
                <div key={idx} className="ring-2 ring-white">
                    <Avatar {...avatar} size="sm" />
                </div>
            ))}
            {remaining > 0 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center justify-center ring-2 ring-white">
                    +{remaining}
                </div>
            )}
        </div>
    )
}

// Chip Component
export const Chip = ({ label, variant = 'neutral', size = 'sm' }) => {
    const variants = {
        neutral: 'bg-gray-100 text-gray-600',
        primary: 'bg-brand-muted text-brand-onColor',
        gold: 'bg-yellow-50 text-yellow-800',
    }

    const sizes = {
        sm: 'h-7 px-3 text-xs',
    }

    return (
        <span className={`inline-flex items-center rounded-pill ${variants[variant]} ${sizes[size]} font-medium`}>
            {label}
        </span>
    )
}

// Button Component
export const Button = ({ children, variant = 'primary', size = 'md', icon, iconPosition = 'start', ...props }) => {
    const variants = {
        primary: 'bg-brand-primary text-white hover:opacity-96',
        gold: 'bg-accent-gold text-white hover:opacity-96',
        success: 'bg-accent-success text-accent-successOnColor hover:opacity-96',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    }

    const sizes = {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-10 px-4 text-base',
    }

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-muted shadow-card ${variants[variant]} ${sizes[size]}`}
            {...props}
        >
            {icon && iconPosition === 'start' && <span>{icon}</span>}
            {children}
            {icon && iconPosition === 'end' && <span>{icon}</span>}
        </button>
    )
}

// IconButton Component
export const IconButton = ({ icon, ...props }) => {
    return (
        <button
            className="w-9 h-9 rounded-pill bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-muted"
            {...props}
        >
            {icon}
        </button>
    )
}

// Card Component
export const Card = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-white',
        subtle: 'bg-gray-50',
    }

    return (
        <div className={`${variants[variant]} rounded-2xl p-5 shadow-card border border-gray-200 hover:shadow-popover transition-shadow ${className}`}>
            {children}
        </div>
    )
}

// Switch Component
export const Switch = ({ checked, onChange, label }) => {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <div
                className={`relative w-11 h-6 rounded-pill transition-colors ${checked ? 'bg-brand-primary' : 'bg-gray-200'
                    }`}
                onClick={() => onChange(!checked)}
            >
                <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                />
            </div>
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </label>
    )
}

// ProgressDonut Component
export const ProgressDonut = ({ progress, size = 46, strokeWidth = 6, label }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#FFF4E0"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#FFB733"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                />
            </svg>
            {label && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-900">{progress}%</span>
                </div>
            )}
        </div>
    )
}

// Badge Component
export const Badge = ({ children, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-brand-primary text-white',
        danger: 'bg-accent-danger text-white',
    }

    return (
        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-md text-xs font-medium ${variants[variant]}`}>
            {children}
        </span>
    )
}
