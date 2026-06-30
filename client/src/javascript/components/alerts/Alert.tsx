import {FC} from 'react';
import classnames from 'classnames';
import {observer} from 'mobx-react-lite';
import {Trans} from '@lingui/react';

import AlertStore from '@client/stores/AlertStore';
import {CircleCheckmark, CircleExclamation} from '@client/ui/icons';

interface AlertProps {
  id: string;
}

const Alert: FC<AlertProps> = observer((props: AlertProps) => {
  const {id} = props;
  const alert = AlertStore.alerts[id];
  const {count, type, detail} = alert || {};

  if (id == null || count == null || type == null) {
    return null;
  }

  const alertClasses = classnames('alert', {
    'is-success': type === 'success',
    'is-error': type === 'error',
  });

  let icon = <CircleCheckmark />;
  if (type === 'error') {
    icon = <CircleExclamation />;
  }

  return (
    <li className={alertClasses}>
      {icon}
      <span className="alert__content">
        <Trans
          id={id}
          values={{
            count,
            countElement: <span className="alert__count">{count}</span>,
          }}
        />
        {detail != null && detail.length > 0 ? (
          <span className="alert__detail" data-testid={`alert-detail-${id}`}>
            {detail}
          </span>
        ) : null}
      </span>
    </li>
  );
});

export default Alert;
