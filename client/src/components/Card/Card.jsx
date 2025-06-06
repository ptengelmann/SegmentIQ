// components/Card/Card.jsx
import React from 'react';
import './Card.scss';
import { ChevronRight } from 'lucide-react';

const Card = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  actions, 
  footer, 
  variant = 'default', 
  compact = false, 
  className = '',
  onClick
}) => {
  const cardClasses = [
    'card',
    variant !== 'default' && `card--${variant}`,
    compact && 'card--compact',
    className,
    onClick && 'cursor-pointer'
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || icon || actions) && (
        <div className="card__header">
          <div className="card__header-title">
            {icon && <div className="card__header-icon">{icon}</div>}
            <div>
              {title && <h3>{title}</h3>}
              {subtitle && <div className="subtitle">{subtitle}</div>}
            </div>
          </div>
          {actions && <div className="card__header-actions">{actions}</div>}
        </div>
      )}
      
      <div className="card__content">{children}</div>
      
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
};

export default Card;