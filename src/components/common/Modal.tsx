import React, { useEffect, useState } from "react";
// import { Modal, Box } from '@mui/material';
import { useComponentStore } from "@stores/index";
import _ from "lodash";

const ModalContainer = () => {
  const [setCloseModal, modalContent] = useComponentStore((s) => [
    s.setCloseModal,
    s.modalContent,
  ]);

  const [open, setOpen] = useState<boolean>(false);

  // const Transition = React.forwardRef((props, ref) => {
  //   return (
  //     // use Slide to display a clearer transition,
  //     // can replace it with Fade
  //     <Slide
  //       ref={ref}
  //       {...props}
  //       // do something after animation exited
  //       onExited={() => {
  //         // history.goBack();
  //       }}
  //     />
  //   );
  // });

  /** 모달 닫기 */
  const handleClickClose = () => {
    setCloseModal();
  };

  useEffect(
    () =>
      useComponentStore.subscribe((state: any) => {
        setOpen(state.isOpenModal);
      }),
    []
  );

  /** ESC클릭시 모달 닫힘 */
  window.onkeyup = function (e) {
    if (e.keyCode === 27) {
      setCloseModal();
    }
  };

  return (
    <div></div>
    // <Modal open={open} onClose={setCloseModal}>
    //   <Box style={{ backgroundColor: 'white', height: '100%' }}>
    //     <Box>
    //       {/* navigation */}
    //       <div className="navigation-header">
    //         <span className="nav-btn right nav-close" onClick={handleClickClose}>
    //           닫기
    //         </span>
    //       </div>
    //       {/* END navigation */}
    //     </Box>
    //     {/* 모달 내용 컴포넌트 영역 */}
    //     <Box>{modalContent}</Box>
    //   </Box>
    // </Modal>
  );
};

export default ModalContainer;
