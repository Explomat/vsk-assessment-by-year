import React from 'react';
import { Modal } from 'semantic-ui-react';

const Instruction = ({ instruction, onClose }) => {
	return (
		<Modal size='large' open closeIcon onClose={onClose}>
			<Modal.Header>Инструкция</Modal.Header>
			<Modal.Content  scrolling>
				<Modal.Description>
					<div dangerouslySetInnerHTML={{ __html: instruction }} />
				</Modal.Description>
			</Modal.Content>
		</Modal>
	);
}

export default Instruction;