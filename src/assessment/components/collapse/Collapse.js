import React from 'react';
import { Collapse } from 'react-collapse';

const MaybeCollapse = ({disableAnimations, children, ...props}) => disableAnimations ? (
	<div className='ReactCollapse--collapse' style='height: auto;'>
		<div className='ReactCollapse--content'>
			{children}
		</div>
	</div>
) : <Collapse {...props}>{children}</Collapse>

export default MaybeCollapse;