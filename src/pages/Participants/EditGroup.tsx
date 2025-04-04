
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditGroupHeader from '@/components/Groups/EditGroup/EditGroupHeader';
import GroupFormCard from '@/components/Groups/EditGroup/GroupFormCard';
import AvailableParticipants from '@/components/Groups/AvailableParticipants';
import DeleteGroupDialog from '@/components/Groups/DeleteGroupDialog';
import LoadingState from '@/components/Groups/EditGroup/LoadingState';
import NotFoundState from '@/components/Groups/EditGroup/NotFoundState';
import { useEditGroup } from '@/components/Groups/EditGroup/useEditGroup';

const EditGroup = () => {
  const navigate = useNavigate();
  const {
    form,
    group,
    isLoadingGroups,
    isLoadingParticipants,
    isSubmitting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedParticipants,
    availableParticipants,
    selectedCategory,
    addParticipant,
    removeParticipant,
    handleNameChange,
    handleRegenerateName,
    handleDeleteGroup,
    onSubmit,
  } = useEditGroup();

  if (isLoadingGroups || isLoadingParticipants) {
    return <LoadingState />;
  }

  if (!group) {
    return <NotFoundState />;
  }

  return (
    <div className="animate-fade-in">
      <EditGroupHeader onDeleteClick={() => setDeleteDialogOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupFormCard
          form={form}
          isSubmitting={isSubmitting}
          selectedParticipants={selectedParticipants}
          handleNameChange={handleNameChange}
          handleRegenerateName={handleRegenerateName}
          removeParticipant={removeParticipant}
          onSubmit={onSubmit}
          onCancel={() => navigate('/participants')}
        />

        <AvailableParticipants 
          availableParticipants={availableParticipants}
          selectedCategory={selectedCategory}
          addParticipant={addParticipant}
          selectedParticipants={selectedParticipants}
          currentGroupId={group.id}
        />
      </div>

      <DeleteGroupDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        group={group}
        onDelete={handleDeleteGroup}
      />
    </div>
  );
};

export default EditGroup;
