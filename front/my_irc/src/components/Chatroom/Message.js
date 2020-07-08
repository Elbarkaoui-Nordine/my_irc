import React from 'react';
import parser from 'bbcode-to-react';


function Message(props) {
return <li style={{background:props.background,color:props.color}} className='p-2'> {parser.toReact(props.message)}</li>;
}
 
export default Message;