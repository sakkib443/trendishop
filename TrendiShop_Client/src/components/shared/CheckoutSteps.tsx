import React from 'react';
import { FiCheck } from 'react-icons/fi';

/** Slim progress indicator shared by the cart and checkout flow. */
const CheckoutSteps = ({ current }: { current: number }) => {
    const steps = ['Cart', 'Delivery', 'Payment'];
    return (
        <div className="flex items-center gap-1.5">
            {steps.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={label}>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                                style={
                                    active || done
                                        ? { background: 'var(--color-primary)', color: '#fff' }
                                        : { background: '#EFEAE3', color: '#9a8f80' }
                                }
                            >
                                {done ? <FiCheck size={12} /> : i + 1}
                            </span>
                            <span className={`text-xs font-semibold ${active ? 'text-gray-900' : 'text-gray-400'} hidden sm:inline`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <span className="w-5 sm:w-7 h-px" style={{ background: i < current ? 'var(--color-primary)' : '#E4DED4' }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default CheckoutSteps;
